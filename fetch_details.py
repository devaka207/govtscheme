import os
import json
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_json(url, headers, retries=5, base_delay=5.0):
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                body = res.read().decode('utf-8')
                return json.loads(body)
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code == 503:
                sleep_time = base_delay * (2 ** attempt)
                print(f"[Rate Limit/Service Error {e.code}] Hit on {url}. Sleeping {sleep_time}s (Attempt {attempt + 1}/{retries})...")
                time.sleep(sleep_time)
            elif e.code == 404:
                print(f"[HTTP Error 404] Page not found for {url}.")
                break
            else:
                sleep_time = 2.0 * (attempt + 1)
                print(f"[HTTP Error {e.code}] {e.reason} for {url}. Sleeping {sleep_time}s (Attempt {attempt + 1}/{retries})...")
                time.sleep(sleep_time)
        except Exception as e:
            sleep_time = 2.0 * (attempt + 1)
            print(f"[Network Error] {e} for {url}. Sleeping {sleep_time}s (Attempt {attempt + 1}/{retries})...")
            time.sleep(sleep_time)
    return None

def fetch_single_scheme(item, output_dir, headers):
    fields = item.get("fields", {})
    slug = fields.get("slug")
    scheme_id = item.get("id")

    if not slug or not scheme_id:
        return "invalid", slug

    output_path = os.path.join(output_dir, f"{slug}.json")
    if os.path.exists(output_path):
        return "skipped", slug

    # Add a polite delay before starting to request a scheme
    time.sleep(0.3)

    # API URLs
    details_url = f"https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={slug}&lang=en"
    docs_url = f"https://api.myscheme.gov.in/schemes/v6/public/schemes/{scheme_id}/documents?lang=en"
    faqs_url = f"https://api.myscheme.gov.in/schemes/v6/public/schemes/{scheme_id}/faqs?lang=en"

    # Fetch main scheme details
    details_data = fetch_json(details_url, headers)
    if details_data is None:
        return "error_details", slug

    # If the scheme details are returned but data is null, it's a deactivated or empty scheme.
    # We save a placeholder file to prevent trying to fetch it again on resumes.
    if details_data.get("data") is None:
        combined = {
            "scheme": None,
            "documents": None,
            "faqs": None,
            "error": "not_found"
        }
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(combined, f, indent=2, ensure_ascii=False)
            return "success_empty", slug
        except Exception as e:
            print(f"Error writing empty placeholder for {slug}: {e}")
            return "error_write", slug

    # Polite throttle between endpoints for the same scheme
    time.sleep(0.3)

    # Fetch documents and FAQs
    docs_data = fetch_json(docs_url, headers)
    time.sleep(0.3)
    faqs_data = fetch_json(faqs_url, headers)

    # Combine responses
    combined = {
        "scheme": details_data.get("data"),
        "documents": docs_data.get("data") if docs_data else None,
        "faqs": faqs_data.get("data") if faqs_data else None
    }

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(combined, f, indent=2, ensure_ascii=False)
        return "success", slug
    except Exception as e:
        print(f"Error writing file for {slug}: {e}")
        return "error_write", slug

def main():
    index_file = "schemes_index.json"
    output_dir = os.path.join("public", "schemes_details")
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(index_file):
        print(f"Error: {index_file} not found. Please run fetch_schemes.py first.")
        return

    with open(index_file, 'r', encoding='utf-8') as f:
        schemes = json.load(f)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
        'Origin': 'https://www.myscheme.gov.in',
        'Referer': 'https://www.myscheme.gov.in/'
    }

    total = len(schemes)
    print(f"Found {total} schemes in index. Starting download of details...")

    # We use 3 worker threads to keep our request rate gentle and avoid 429 blocks
    max_workers = 3
    success_count = 0
    empty_count = 0
    skipped_count = 0
    error_count = 0

    start_time = time.time()

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(fetch_single_scheme, item, output_dir, headers): item for item in schemes}
        
        for index, future in enumerate(as_completed(futures)):
            status, slug = future.result()
            
            if status == "success":
                success_count += 1
            elif status == "success_empty":
                empty_count += 1
            elif status == "skipped":
                skipped_count += 1
            else:
                error_count += 1
                print(f"Error fetching scheme details for slug: {slug} (Status: {status})")

            # Progress update every 50 items
            if (index + 1) % 50 == 0 or (index + 1) == total:
                elapsed = time.time() - start_time
                speed = (index + 1) / elapsed if elapsed > 0 else 0
                eta = (total - (index + 1)) / speed if speed > 0 else 0
                print(f"Progress: {index + 1}/{total} completed | Success: {success_count} | Empty: {empty_count} | Skipped: {skipped_count} | Errors: {error_count} | Speed: {speed:.1f} schemes/sec | ETA: {eta/60:.1f} min")

    print(f"\nDownload finished in {(time.time() - start_time)/60:.1f} minutes!")
    print(f"Summary: Success: {success_count} | Empty: {empty_count} | Skipped: {skipped_count} | Errors: {error_count}")

if __name__ == "__main__":
    main()
