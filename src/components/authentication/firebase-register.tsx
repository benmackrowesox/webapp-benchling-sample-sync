import type { FC } from "react";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Checkbox,
  FormHelperText,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useTypedAuth } from "../../hooks/use-auth";
import { useMounted } from "../../hooks/use-mounted";
import { UserRegistrationFields } from "src/types/user";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface FormikRegistrationValues extends UserRegistrationFields {
  policy: boolean;
  submit?: string;
}

export const FirebaseRegister: FC = (props) => {
  const isMounted = useMounted();
  const router = useRouter();
  const { createUser: createUser, sendVerificationEmail } = useTypedAuth();
  const formik = useFormik<FormikRegistrationValues>({
    initialValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
      company: "",
      contactNo: "",
      policy: true,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      password: Yup.string().min(7).max(255).required("Password is required"),
      firstName: Yup.string()
        .max(255)
        .trim()
        .required("First Name is required"),
      lastName: Yup.string().max(255).trim().required("Last Name is required"),
      company: Yup.string().max(255).trim().required("Company is required"),
      role: Yup.string().max(255).trim().required("Role is required"),
      policy: Yup.boolean().oneOf([true], "This field must be checked"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        await createUser(values);
        if (isMounted()) {
          const returnUrl =
            (router.query.returnUrl as string | undefined) ||
            "/new-customer-questionnaire";
          await router.push(returnUrl).catch(console.error);
          await sendVerificationEmail();
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
        <TextField
          error={Boolean(formik.touched.firstName && formik.errors.firstName)}
          fullWidth
          helperText={formik.touched.firstName && formik.errors.firstName}
          label="First Name"
          margin="normal"
          name="firstName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.firstName}
        />
        <TextField
          error={Boolean(formik.touched.lastName && formik.errors.lastName)}
          fullWidth
          helperText={formik.touched.lastName && formik.errors.lastName}
          label="Last Name"
          margin="normal"
          name="lastName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.lastName}
        />

        <TextField
          error={Boolean(formik.touched.company && formik.errors.company)}
          fullWidth
          helperText={formik.touched.company && formik.errors.company}
          label="Company"
          margin="normal"
          name="company"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.company}
        />
        <TextField
          error={Boolean(formik.touched.role && formik.errors.role)}
          fullWidth
          helperText={formik.touched.role && formik.errors.role}
          label="Role"
          margin="normal"
          name="role"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.role}
        />

        <PhoneInput
          country={"gb"}
          onChange={(val, country, e, formattedValue) => {
            formik.handleChange("contactNo")(formattedValue);
          }}
          inputStyle={{ width: "100%", height: "50px" }}
          containerStyle={{ marginTop: "15px" }}
          placeholder="+44"
          value={formik.values.contactNo ?? ""}
          isValid={
            !Boolean(formik.touched.contactNo && formik.errors.contactNo)
          }
        />
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            ml: -1,
            mt: 2,
          }}
        >
          <Checkbox
            checked={formik.values.policy}
            name="policy"
            onChange={formik.handleChange}
          />
          <Typography color="textSecondary" variant="body2">
            I have read the{" "}
            <Link component="a" href="/privacy-policy">
              Privacy Policy
            </Link>
          </Typography>
        </Box>
        {Boolean(formik.touched.policy && formik.errors.policy) && (
          <FormHelperText error>{formik.errors.policy}</FormHelperText>
        )}
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
            Register
          </Button>
        </Box>
      </form>
    </div>
  );
};
