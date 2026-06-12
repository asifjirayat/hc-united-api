import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { name, email, phone, subject, message } = req.body;

    const result = await resend.emails.send({
      from: "HC United <info@hcunited.co.uk>",
      to: ["info@hcunited.co.uk"],
      replyTo: email,
      subject: `Website Enquiry: ${subject || "General Enquiry"}`,
      html: `
        <h2>New Website Enquiry</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Subject:</strong> ${subject || "-"}</p>

        <hr />

        <p>${message}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
