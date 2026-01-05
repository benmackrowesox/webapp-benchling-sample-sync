import type { FC } from "react";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useFormik } from "formik";
import NextLink from "next/link";
import { Box, Button, Divider, FormHelperText, TextField } from "@mui/material";
import { useAuth, useTypedAuth } from "../../hooks/use-auth";
import { useMounted } from "../../hooks/use-mounted";

export const FirebaseLogin: FC = (props) => {
  const isMounted = useMounted();
  const router = useRouter();
  const { signInWithEmailAndPassword, signInWithGoogle } = useTypedAuth();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      password: Yup.string().max(255).required("Password is required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        await signInWithEmailAndPassword(values.email, values.password);

        if (isMounted()) {
          const returnUrl =
            (router.query.returnUrl as string | undefined) ||
            "/dashboard/orders";
          router.push(returnUrl).catch(console.error);
        }
      } catch (err) {
        console.error(err);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  const handleGoogleClick = async (): Promise<void> => {
    try {
      await signInWithGoogle();

      if (isMounted()) {
        const returnUrl =
          (router.query.returnUrl as string | undefined) || "/dashboard/orders";
        router.push(returnUrl).catch(console.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div {...props}>
      <form noValidate onSubmit={formik.handleSubmit}>
        <TextField
          error={Boolean(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label="Email Address"
          margin="normal"
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="email"
          value={formik.values.email}
        />
        <TextField
          error={Boolean(formik.touched.password && formik.errors.password)}
          fullWidth
          helperText={formik.touched.password && formik.errors.password}
          label="Password"
          margin="normal"
          name="password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="password"
          value={formik.values.password}
        />
        {formik.errors.submit && (
          <Box sx={{ mt: 3 }}>
            <FormHelperText error>{formik.errors.submit}</FormHelperText>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Button
            disabled={formik.isSubmitting}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            Log In
          </Button>
        </Box>
      </form>
      <Divider sx={{ my: 2 }} />
      <NextLink href="/authentication/send-password-reset" passHref legacyBehavior>
        <Button component="a">Forgot Password?</Button>
      </NextLink>
      <NextLink href="/authentication/register" passHref legacyBehavior>
        <Button component="a">{`Don't have a account?`}</Button>
      </NextLink>
    </div>
  );
};
