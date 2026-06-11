import urllib.request
import urllib.error
import json
import time

def fetch_all_schemes():
    url_template = "https://api.myscheme.gov.in/search/v6/schemes?lang=en&q=&keyword=&sort=&from={from_val}&size=100"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
        'Origin': 'https://www.myscheme.gov.in',
        'Referer': 'https://www.myscheme.gov.in/'
    }

    all_schemes = []
    total_schemes = 4714
    batch_size = 100

    print("Starting download of all government schemes index...")

    for from_val in range(0, total_schemes, batch_size):
        url = url_template.format(from_val=from_val)
        req = urllib.request.Request(url, headers=headers)
        
        retries = 3
        success = False
        while retries > 0 and not success:
            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode('utf-8')
                    data = json.loads(res_body)
                    
                    if data.get('status') == 'Success' and 'data' in data:
                        hits = data['data']['hits']['items']
                        all_schemes.extend(hits)
                        print(f"Downloaded batch {from_val} to {from_val + len(hits)}... Total so far: {len(all_schemes)}")
                        success = True
                    else:
                        print(f"Failed to fetch batch {from_val}: Status failure or malformed data.")
                        retries -= 1
            except urllib.error.HTTPError as e:
                print(f"HTTP Error {e.code} on batch starting from {from_val}: {e.reason}")
                retries -= 1
                time.sleep(1)
            except Exception as e:
                print(f"General Error on batch starting from {from_val}: {e}")
                retries -= 1
                time.sleep(1)
                
        if not success:
            print(f"Failed to download batch starting from {from_val} after 3 retries. Aborting.")
            break

        # Subtle throttle to respect rate limits
        time.sleep(0.1)

    if all_schemes:
        output_file = "schemes_index.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_schemes, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved {len(all_schemes)} schemes to {output_file}!")
    else:
        print("No schemes downloaded.")

if __name__ == "__main__":
    fetch_all_schemes()
