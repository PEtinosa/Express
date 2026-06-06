//  set up an SMTP(simple mail transfer protocol)
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'praiseetinosa06@gmail.com',
    pass: 'rayy tnqv oglj lsna' 
  }
});
