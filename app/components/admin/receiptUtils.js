"use client";

// Export a node (receipt preview) to PDF, PNG, or JPG.
// Uses html-to-image (native SVG foreignObject rendering) so it correctly
// supports modern CSS (Tailwind v4 oklch colors, border-radius, fonts, images).
// html2canvas cannot parse Tailwind v4's oklch() colors and produced blank files.

// Shared capture options for a high-resolution, pixel-perfect export.
const captureOptions = {
  pixelRatio: 2,
  backgroundColor: "#ffffff",
  cacheBust: true,
  width: undefined, // let html-to-image measure the node
  height: undefined,
};

async function captureCanvas(node) {
  const { toCanvas } = await import("html-to-image");
  return toCanvas(node, captureOptions);
}

function triggerDownload(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportReceipt(node, format, filename) {
  if (!node) throw new Error("No receipt to export");

  const canvas = await captureCanvas(node);

  if (format === "png" || format === "jpg") {
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const quality = format === "jpg" ? 0.95 : undefined;
    const dataUrl = canvas.toDataURL(mime, quality);
    triggerDownload(dataUrl, `${filename}.${format}`);
    return dataUrl;
  }

  // PDF — render the captured canvas onto an A4 page.
  const { jsPDF } = await import("jspdf");
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(`${filename}.pdf`);
  return imgData;
}

// Build a share text describing the receipt
export function buildShareText(receipt) {
  const customer = receipt.customer?.name || "";
  const amount = (receipt.price || receipt.amountPaid || 0).toLocaleString();
  const currency = receipt.currency || "PKR";
  return `Receipt ${receipt.receiptNumber} from Pashto DevZone. Customer: ${customer}. Amount: ${currency} ${amount}.`;
}

// Web Share API with fallback options
export async function shareReceipt(receipt) {
  const text = buildShareText(receipt);
  const url =
    typeof window !== "undefined" ? window.location.href : "";

  const shareData = {
    title: `Receipt ${receipt.receiptNumber}`,
    text,
    url,
  };

  // Try native Web Share API
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (err) {
      if (err.name === "AbortError") return "cancelled";
      // fall through to fallback options
    }
  }

  // Fallback: return the list of fallback actions
  return "fallback";
}

// Build protocol-based share links
export function buildShareLinks(receipt) {
  const text = encodeURIComponent(buildShareText(receipt));
  const url = encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : ""
  );
  const phone = encodeURIComponent("03245020658");

  return {
    whatsapp: `https://wa.me/${phone}?text=${text}%0A${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    messenger: `fb-messenger://share/?link=${url}`,
    email: `mailto:?subject=${encodeURIComponent(
      `Receipt ${receipt.receiptNumber}`
    )}&body=${text}%0A${url}`,
  };
}

export async function copyLink() {
  const url =
    typeof window !== "undefined" ? window.location.href : "";
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

// Copy the exported image (PNG blob) to the clipboard.
export async function copyImage(node) {
  if (!node) throw new Error("No receipt to copy");
  const canvas = await captureCanvas(node);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Could not create image");
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    // Fallback: try to copy the data URL
    try {
      await navigator.clipboard.writeText(canvas.toDataURL("image/png"));
      return true;
    } catch {
      return false;
    }
  }
}
