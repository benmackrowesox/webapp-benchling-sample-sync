import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Address } from "src/types/user";

export interface EditAddressCardProps {
  address: Address;
  updateAddress: (address: Address) => void;
}

export const EditAddressCard = (props: EditAddressCardProps) => {
  const { address, updateAddress } = props;
  const { name, line1, line2, townCity, county, country, postcode } = address;

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item md={4} xs={12}>
            <Typography variant="h6">Delivery Address</Typography>
          </Grid>
          <Grid item md={8} xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <TextField
                value={name}
                onChange={(event) =>
                  updateAddress({ ...address, name: event.target.value })
                }
                label="Name"
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
              }}
            >
              <TextField
                value={postcode}
                onChange={(event) =>
                  updateAddress({ ...address, postcode: event.target.value })
                }
                label="Postcode"
                size="small"
                sx={{
                  flexGrow: 1,
                  mr: 3,
                  mt: 3,
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
                value={line1}
                onChange={(event) =>
                  updateAddress({ ...address, line1: event.target.value })
                }
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
                onChange={(event) =>
                  updateAddress({ ...address, line2: event.target.value })
                }
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
                onChange={(event) =>
                  updateAddress({ ...address, townCity: event.target.value })
                }
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
                onChange={(event) =>
                  updateAddress({ ...address, county: event.target.value })
                }
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
                value={country}
                onChange={(event) =>
                  updateAddress({ ...address, country: event.target.value })
                }
                label="Country"
                size="small"
                sx={{
                  flexGrow: 1,
                  mr: 3,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
