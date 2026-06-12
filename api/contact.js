import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const handler = async (req, res) => {
  console.log("API Key exists:", !!process.env.RESEND_API_KEY);

  // CORS
  const allowedOrigins = [
    "https://hcunited.co.uk",
    "https://www.hcunited.co.uk",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      website, // Honeypot
    } = req.body;

    // Honeypot spam protection
    if (website) {
      return res.status(200).json({
        success: true,
      });
    }

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      });
    }

    // Email to HC United
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["info@hcunited.co.uk"],
      replyTo: email,
      subject: `Website Enquiry: ${subject}`,
      html: `
        <h2>New Website Enquiry</h2>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Phone:</strong> ${phone || "-"}</p>

        <p><strong>Subject:</strong> ${subject}</p>

        <hr />

        <p>${message}</p>
      `,
    });

    // Auto Reply
    // await resend.emails.send({
    //   from: "onboarding@resend.dev",
    //   to: [email],
    //   subject: "Thank you for contacting HC United",
    //   html: `
    //     <h2>Thank you for contacting HC United</h2>

    //     <p>
    //       We have received your enquiry and a member
    //       of our team will respond as soon as possible.
    //     </p>

    //     <p>
    //       Kind Regards,<br />
    //       HC United Limited
    //     </p>
    //   `,
    // });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export default handler;
