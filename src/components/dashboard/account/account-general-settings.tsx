import { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useTypedAuth } from "src/hooks/use-auth";
import toast from "react-hot-toast";
import { getUserDetails } from "src/lib/client/firebase";
import { firestoreUser } from "src/types/user";
import { PageHelpSection } from "src/components/dashboard/page-help-section";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export const AccountGeneralSettings: FC = (props) => {
  const { user, sendRequest } = useTypedAuth();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [postcode, setPostcode] = useState<string>("");
  const [line1, setLine1] = useState<string>("");
  const [line2, setLine2] = useState<string>("");
  const [townCity, setTownCity] = useState<string>("");
  const [county, setCounty] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      await getUserDetails(user?.id)
        .then((user) => {
          console.log({ user });
          setFirstName(user.firstName ?? "");
          setLastName(user.lastName ?? "");
          setPhoneNumber(user.contactNo ?? "");
          setPostcode(user.postcode ?? "");
          setLine1(user.line1 ?? "");
          setLine2(user.line2 ?? "");
          setTownCity(user.townCity ?? "");
          setCounty(user.county ?? "");
          setCountry(user.country ?? "");
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchUser();
  }, [user?.id]);

  const handleUpdateUser = async (update: Partial<firestoreUser>) => {
    sendRequest(`/api/users/${user?.id}`, "PATCH", update)
      .then(() => {
        toast.success("Account updated");
      })
      .catch((error) => {
        toast.error("Unable to update account");
        console.log(error);
      });
  };

  return (
    <Box sx={{ mt: 4 }} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Basic details</Typography>
              <PageHelpSection>
                <span>
                  Be sure to keep your contact details and address up to date,
                  so that we can easily get in touch with you.
                </span>
              </PageHelpSection>
            </Grid>
            <Grid item md={8} xs={12}>
              <Box
                sx={{
                  display: "flex",
                  mt: 3,
                  alignItems: "center",
                }}
              >
                <TextField
                  defaultValue={user?.email}
                  disabled
                  label="Email Address"
                  required
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderStyle: "dashed",
                    },
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  mt: 3,
                  alignItems: "center",
                }}
              >
                <TextField
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  label="First Name"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
                <TextField
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  label="Last Name"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
                <Button
                  onClick={() =>
                    handleUpdateUser({
                      firstName: firstName,
                      lastName: lastName,
                    })
                  }
                >
                  Save
                </Button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  mt: 3,
                  alignItems: "flex-end",
                }}
              >
                <PhoneInput
                  country={"gb"}
                  onChange={(val, country, e, formattedValue) => {
                    setPhoneNumber(formattedValue);
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "38px",
                  }}
                  containerStyle={{ marginTop: "15px" }}
                  placeholder="+44"
                  searchStyle={{ borderColor: "lightblue" }}
                  value={phoneNumber}
                />
                <Button
                  onClick={() =>
                    handleUpdateUser({
                      contactNo: phoneNumber,
                    })
                  }
                >
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Address</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  value={line1}
                  onChange={(event) => setLine1(event.target.value)}
                  label="Address line 1 (or Company Name)"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <TextField
                  value={line2}
                  onChange={(event) => setLine2(event.target.value)}
                  label="Address line 2"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <TextField
                  value={townCity}
                  onChange={(event) => setTownCity(event.target.value)}
                  label="Town/City"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <TextField
                  value={county}
                  onChange={(event) => setCounty(event.target.value)}
                  label="County (if applicable)"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <TextField
                  value={postcode}
                  onChange={(event) => setPostcode(event.target.value)}
                  label="Postcode"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <TextField
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  label="Country"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: 3,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() =>
                    handleUpdateUser({
                      postcode: postcode || "",
                      line1: line1 || "",
                      line2: line2 || "",
                      townCity: townCity || "",
                      county: county || "",
                      country: country || "",
                    })
                  }
                >
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* <Card sx={{ mt: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Delete Account</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Typography sx={{ mb: 3 }} variant="subtitle1">
                Delete your account and all of your source data. This is
                irreversible.
              </Typography>
              <Button color="error" variant="outlined">
                Delete account
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card> */}
    </Box>
  );
};
