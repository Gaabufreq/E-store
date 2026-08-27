export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Agar script pehle se loaded hai to dubara load na karein
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// isko abhi ignore krna