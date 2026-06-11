<?php
// Logo component for Finn. Using optimized high-resolution transparent PNGs.
$logo_class = isset($class) ? $class : 'h-8 w-auto';
?>
<img 
  src="/assets/images/logo-light.png" 
  alt="Finn." 
  class="logo-img inline-block dark:hidden <?php echo htmlspecialchars($logo_class); ?>"
/>
<img 
  src="/assets/images/logo-dark.png" 
  alt="Finn." 
  class="logo-img hidden dark:inline-block <?php echo htmlspecialchars($logo_class); ?>"
/>
