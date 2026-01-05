import { FC, FormEvent, useRef } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

export const ContactForm: FC = () => {
  const form = useRef();
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const name = (
      event.currentTarget.elements.namedItem("name") as HTMLInputElement
    ).value;
    const companyName = (
      event.currentTarget.elements.namedItem("company") as HTMLInputElement
    ).value;
    const email = (
      event.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const phoneNumber = (
      event.currentTarget.elements.namedItem("phone") as HTMLInputElement
    ).value;
    const message = (
      event.currentTarget.elements.namedItem("message") as HTMLInputElement
    ).value;
    console.log({
      name,
      companyName,
      email,
      phoneNumber,
      message,
    });
    emailjs
      .send(
        "service_t0jygiw",
        "template_odvs6dk",
        {
          email,
          phoneNumber,
          message,
          from_name: name,
          company_name: companyName,
        },
        "qadH2DkIXJX8tx_7L"
      )
      .then(
        (result) => {
          toast.success("Email sent");
          const input = document.getElementById(
            "create-course-form"
          ) as HTMLFormElement;
          input.reset();
        },
        (error) => {
          toast.error(
            "Email encounted an error please send a email to inquiries@esoxbio.com"
          );
          const input = document.getElementById(
            "create-course-form"
          ) as HTMLFormElement;
          input.reset();
        }
      );
  };

  return (
    <form id="create-course-form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ mb: 1 }} variant="subtitle2">
            Full Name
          </Typography>
          <TextField fullWidth name="name" type="name" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ mb: 1 }} variant="subtitle2">
            Company Name
          </Typography>
          <TextField fullWidth name="company" type="company" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ mb: 1 }} variant="subtitle2">
            Email
          </Typography>
          <TextField fullWidth name="email" type="email" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ mb: 1 }} variant="subtitle2">
            Phone Number
          </Typography>
          <TextField fullWidth name="phone" required type="tel" />
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ mb: 1 }} variant="subtitle2">
            Message
          </Typography>
          <TextField fullWidth name="message" required multiline rows={6} />
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        <Button fullWidth size="large" variant="contained" type="submit">
          Let&apos;s Talk
        </Button>
      </Box>
    </form>
  );
};
