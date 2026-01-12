export const isMobilePhone = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Check if it's a phone based on screen size (phones are typically < 768px width)
  // and aspect ratio (phones are usually taller than they are wide)
  const isSmallScreen = screenWidth < 768;
  const isTallScreen = screenHeight > screenWidth;

  // Check user agent for mobile phone indicators
  // Exclude iPad and tablets
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

  // If it's identified as a tablet, it's not a phone
  if (isTablet) return false;

  // If screen is small and tall, and user agent suggests mobile, it's a phone
  if (isSmallScreen && isTallScreen && isMobileUA) return true;

  // Additional check: if screen width is very small (typical phone size)
  if (screenWidth < 640) return true;

  return false;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';

  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;

  // Check for tablets first
  if (/ipad|android(?!.*mobile)|tablet/i.test(userAgent)) {
    return 'tablet';
  }

  // Check for phones
  if (isMobilePhone()) {
    return 'mobile';
  }

  // Check screen size for tablet range (768-1024px typically)
  if (screenWidth >= 768 && screenWidth <= 1024) {
    return 'tablet';
  }

  return 'desktop';
};
