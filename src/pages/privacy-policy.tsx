import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Container,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { MainLayout } from "src/components/main-layout";

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | Esox Biologics</title>
        <meta
          property="og:title"
          content="Privacy Policy | Esox Biologics"
          key="title"
        />
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography sx={{ mt: 3, mb: 2 }} variant="h3">
            Privacy Policy for Esox Biologics
          </Typography>
          <Typography sx={{ my: 2 }} variant="subtitle1">
            Last updated: January 06, 2023
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            This Privacy Policy describes Our policies and procedures on the
            collection, use and disclosure of Your information when You use the
            Service and tells You about Your privacy rights and how the law
            protects You.
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We use Your Personal data to provide and improve the Service. By
            using the Service, You agree to the collection and use of
            information in accordance with this Privacy Policy.
          </Typography>
          <Typography sx={{ my: 2 }} variant="h4">
            Interpretation and Definitions
          </Typography>
          <Typography sx={{ my: 2 }} variant="h5">
            Interpretation
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The words of which the initial letter is capitalized have meanings
            defined under the following conditions. The following definitions
            shall have the same meaning regardless of whether they appear in
            singular or in plural.
          </Typography>
          <Typography sx={{ my: 2 }} variant="h5">
            Definitions
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            For the purposes of this Privacy Policy:
          </Typography>
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Account
                </Box>{" "}
                means a unique account created for You to access our Service or
                parts of our Service.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Company
                </Box>{" "}
                {`(referred to as either "the Company", "We", "Us" or "Our" in
                this Agreement) refers to Esox Biologics Ltd, 84 Wood Lane,
                London. W12 0BZ. For the purpose of the GDPR, the Company is the
                Data Controller.`}
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Cookies
                </Box>{" "}
                are small files that are placed on Your computer, mobile device
                or any other device by a website, containing the details of Your
                browsing history on that website among its many uses.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Country
                </Box>{" "}
                refers to: United Kingdom
              </Typography>
            </ListItem>

            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Data Controller
                </Box>
                , for the purposes of the GDPR (General Data Protection
                Regulation), refers to the Company as the legal person which
                alone or jointly with others determines the purposes and means
                of the processing of Personal Data.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Device
                </Box>{" "}
                means any device that can access the Service such as a computer,
                a cellphone or a digital tablet.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Personal Data
                </Box>{" "}
                is any information that relates to an identified or identifiable
                individual. For the purposes of GDPR, Personal Data means any
                information relating to You such as a name, an identification
                number, location data, online identifier or to one or more
                factors specific to the physical, physiological, genetic,
                mental, economic, cultural or social identity.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Service
                </Box>{" "}
                refers to the Website.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Service Provider
                </Box>{" "}
                means any natural or legal person who processes the data on
                behalf of the Company. It refers to third-party companies or
                individuals employed by the Company to facilitate the Service,
                to provide the Service on behalf of the Company, to perform
                services related to the Service or to assist the Company in
                analyzing how the Service is used. For the purpose of the GDPR,
                Service Providers are considered Data Processors.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Usage Data
                </Box>{" "}
                refers to data collected automatically, either generated by the
                use of the Service or from the Service infrastructure itself
                (for example, the duration of a page visit).
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Website
                </Box>{" "}
                refers to Esox Biologics, accessible from{" "}
                <Link href="https://www.esoxbiologics.com">
                  www.esoxbiologics.com
                </Link>
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  You
                </Box>{" "}
                means the individual accessing or using the Service, or the
                company, or other legal entity on behalf of which such
                individual is accessing or using the Service, as applicable.
                Under GDPR (General Data Protection Regulation), You can be
                referred to as the Data Subject or as the User as you are the
                individual using the Service.
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ my: 2 }} variant="h3">
            Collecting and Using Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} variant="h4">
            Types of Data Collected
          </Typography>
          <Typography sx={{ my: 2 }} variant="h5">
            Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            While using Our Service, We may ask You to provide Us with certain
            personally identifiable information that can be used to contact or
            identify You. Personally identifiable information may include, but
            is not limited to:
          </Typography>
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Email address
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                First name and last name
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Phone number
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Address, State, Province, ZIP/Postal code, City
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Usage Data
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ my: 2 }} variant="h5">
            Usage Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            Usage Data is collected automatically when using the Service.
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            {`Usage Data may include information such as Your Device's Internet
            Protocol address (e.g. IP address), browser type, browser version,
            the pages of our Service that You visit, the time and date of Your
            visit, the time spent on those pages, unique device identifiers and
            other diagnostic data.`}
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            When You access the Service by or through a mobile device, We may
            collect certain information automatically, including, but not
            limited to, the type of mobile device You use, Your mobile device
            unique ID, the IP address of Your mobile device, Your mobile
            operating system, the type of mobile Internet browser You use,
            unique device identifiers and other diagnostic data.
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may also collect information that Your browser sends whenever You
            visit our Service or when You access the Service by or through a
            mobile device.
          </Typography>
          <Typography sx={{ my: 2 }} variant="h5">
            Tracking Technologies and Cookies
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We use Cookies and similar tracking technologies to track the
            activity on Our Service and store certain information. Tracking
            technologies used are beacons, tags, and scripts to collect and
            track information and to improve and analyze Our Service. The
            technologies We use may include:
          </Typography>
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Cookies or Browser Cookies.
                </Box>{" "}
                A cookie is a small file placed on Your Device. You can instruct
                Your browser to refuse all Cookies or to indicate when a Cookie
                is being sent. However, if You do not accept Cookies, You may
                not be able to use some parts of our Service. Unless you have
                adjusted Your browser setting so that it will refuse Cookies,
                our Service may use Cookies.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Web Beacons.
                </Box>{" "}
                Certain sections of our Service and our emails may contain small
                electronic files known as web beacons (also referred to as clear
                gifs, pixel tags, and single-pixel gifs) that permit the
                Company, for example, to count users who have visited those
                pages or opened an email and for other related website
                statistics (for example, recording the popularity of a certain
                section and verifying system and server integrity).
              </Typography>
            </ListItem>
          </List>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            {`Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies
            remain on Your personal computer or mobile device when You go
            offline, while Session Cookies are deleted as soon as You close Your
            web browser. Learn more about cookies on the Free Privacy Policy
            website article.`}
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We use both Session and Persistent Cookies for the purposes set out
            below:
          </Typography>
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Necessary / Essential Cookies
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Type: Session Cookies
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Administered by: Us
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Purpose: These Cookies are essential to provide You with
                  services available through the Website and to enable You to
                  use some of its features. They help to authenticate users and
                  prevent fraudulent use of user accounts. Without these
                  Cookies, the services that You have asked for cannot be
                  provided, and We only use these Cookies to provide You with
                  those services.
                </Typography>
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Cookies Policy / Notice Acceptance Cookies
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Type: Persistent Cookies
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Administered by: Us
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Purpose: These Cookies identify if users have accepted the use
                  of cookies on the Website.
                </Typography>
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Functionality Cookies
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Type: Persistent Cookies
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Administered by: Us
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Purpose: These Cookies allow us to remember choices You make
                  when You use the Website, such as remembering your login
                  details or language preference. The purpose of these Cookies
                  is to provide You with a more personal experience and to avoid
                  You having to re-enter your preferences every time You use the
                  Website.
                </Typography>
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Tracking and Performance Cookies
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Type: Persistent Cookies
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Administered by: Third-Parties
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Purpose: These Cookies are used to track information about
                  traffic to the Website and how users use the Website. The
                  information gathered via these Cookies may directly or
                  indirectly identify you as an individual visitor. This is
                  because the information collected is typically linked to a
                  pseudonymous identifier associated with the device you use to
                  access the Website. We may also use these Cookies to test new
                  pages, features or new functionality of the Website to see how
                  our users react to them.
                </Typography>
              </Typography>
            </ListItem>
          </List>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            For more information about the cookies we use and your choices
            regarding cookies, please visit our Cookies Policy or the Cookies
            section of our Privacy Policy.
          </Typography>
          <Typography sx={{ my: 2 }} variant="h4">
            Use of Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Company may use Personal Data for the following purposes:
          </Typography>
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  To provide and maintain our Service,
                </Box>{" "}
                including to monitor the usage of our Service.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  To manage Your Account:
                </Box>{" "}
                to manage Your registration as a user of the Service. The
                Personal Data You provide can give You access to different
                functionalities of the Service that are available to You as a
                registered user.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  For the performance of a contract:
                </Box>{" "}
                the development, compliance and undertaking of the purchase
                contract for the products, items or services You have purchased
                or of any other contract with Us through the Service.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  To contact You:
                </Box>{" "}
                {`To contact You by email, telephone calls, SMS, or other
                equivalent forms of electronic communication, such as a mobile
                application's push notifications regarding updates or
                informative communications related to the functionalities,
                products or contracted services, including the security updates,
                when necessary or reasonable for their implementation.`}
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  To provide You
                </Box>{" "}
                with news, special offers and general information about other
                goods, services and events which we offer that are similar to
                those that you have already purchased or enquired about unless
                You have opted not to receive such information.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  To manage Your requests:
                </Box>{" "}
                To attend and manage Your requests to Us.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  For business transfers:
                </Box>{" "}
                We may use Your information to evaluate or conduct a merger,
                divestiture, restructuring, reorganization, dissolution, or
                other sale or transfer of some or all of Our assets, whether as
                a going concern or as part of bankruptcy, liquidation, or
                similar proceeding, in which Personal Data held by Us about our
                Service users is among the assets transferred.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  For other purposes:
                </Box>{" "}
                We may use Your information for other purposes, such as data
                analysis, identifying usage trends, determining the
                effectiveness of our promotional campaigns and to evaluate and
                improve our Service, products, services, marketing and your
                experience.
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may share Your personal information in the following situations:
          </Typography>
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  With Service Providers:
                </Box>{" "}
                We may share Your personal information with Service Providers to
                monitor and analyze the use of our Service, to contact You.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  For business transfers:
                </Box>{" "}
                We may share or transfer Your personal information in connection
                with, or during negotiations of, any merger, sale of Company
                assets, financing, or acquisition of all or a portion of Our
                business to another company.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  With Affiliates:
                </Box>{" "}
                We may share Your information with Our affiliates, in which case
                we will require those affiliates to honor this Privacy Policy.
                Affiliates include Our parent company and any other
                subsidiaries, joint venture partners or other companies that We
                control or that are under common control with Us.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  With business partners:
                </Box>{" "}
                We may share Your information with Our business partners to
                offer You certain products, services or promotions.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  With other users:
                </Box>{" "}
                when You share personal information or otherwise interact in the
                public areas with other users, such information may be viewed by
                all users and may be publicly distributed outside.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  With Your consent:
                </Box>{" "}
                We may disclose Your personal information for any other purpose
                with Your consent.
              </Typography>
            </ListItem>{" "}
          </List>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Retention of Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Company will retain Your Personal Data only for as long as is
            necessary for the purposes set out in this Privacy Policy. We will
            retain and use Your Personal Data to the extent necessary to comply
            with our legal obligations (for example, if we are required to
            retain your data to comply with applicable laws), resolve disputes,
            and enforce our legal agreements and policies.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Company will also retain Usage Data for internal analysis
            purposes. Usage Data is generally retained for a shorter period of
            time, except when this data is used to strengthen the security or to
            improve the functionality of Our Service, or We are legally
            obligated to retain this data for longer time periods.
          </Typography>
          <Typography sx={{ my: 2 }} variant="h4">
            Transfer of Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            {`Your information, including Personal Data, is processed at the
            Company's operating offices and in any other places where the
            parties involved in the processing are located. It means that this
            information may be transferred to — and maintained on — computers
            located outside of Your state, province, country or other
            governmental jurisdiction where the data protection laws may differ
            than those from Your jurisdiction.`}
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            Your consent to this Privacy Policy followed by Your submission of
            such information represents Your agreement to that transfer.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Company will take all steps reasonably necessary to ensure that
            Your data is treated securely and in accordance with this Privacy
            Policy and no transfer of Your Personal Data will take place to an
            organization or a country unless there are adequate controls in
            place including the security of Your data and other personal
            information.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Delete Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            You have the right to delete or request that We assist in deleting
            the Personal Data that We have collected about You.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            Our Service may give You the ability to delete certain information
            about You from within the Service.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            You may update, amend, or delete Your information at any time by
            signing in to Your Account, if you have one, and visiting the
            account settings section that allows you to manage Your personal
            information. You may also contact Us to request access to, correct,
            or delete any personal information that You have provided to Us.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            Please note, however, that We may need to retain certain information
            when we have a legal obligation or lawful basis to do so.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Disclosure of Your Personal Data
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h5">
            Business Transactions
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            If the Company is involved in a merger, acquisition or asset sale,
            Your Personal Data may be transferred. We will provide notice before
            Your Personal Data is transferred and becomes subject to a different
            Privacy Policy.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h5">
            Law enforcement
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            Under certain circumstances, the Company may be required to disclose
            Your Personal Data if required to do so by law or in response to
            valid requests by public authorities (e.g. a court or a government
            agency).
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h5">
            Other legal requirements
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Company may disclose Your Personal Data in the good faith belief
            that such action is necessary to:
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Comply with a legal obligation
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Protect and defend the rights or property of the Company
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Prevent or investigate possible wrongdoing in connection with
                the Service
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Protect the personal safety of Users of the Service or the
                public
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                Protect against legal liability
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ my: 2 }} variant="h4">
            Security of Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The security of Your Personal Data is important to Us, but remember
            that no method of transmission over the Internet, or method of
            electronic storage is 100% secure. While We strive to use
            commercially acceptable means to protect Your Personal Data, We
            cannot guarantee its absolute security.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h3">
            Detailed Information on the Processing of Your Personal Data
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Service Providers We use may have access to Your Personal Data.
            These third-party vendors collect, store, use, process and transfer
            information about Your activity on Our Service in accordance with
            their Privacy Policies.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Analytics
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may use third-party Service providers to monitor and analyze the
            use of our Service.
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Google Analytics
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Google Analytics is a web analytics service offered by Google
                  that tracks and reports website traffic. Google uses the data
                  collected to track and monitor the use of our Service. This
                  data is shared with other Google services. Google may use the
                  collected data to contextualize and personalize the ads of its
                  own advertising network.
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  You can opt-out of having made your activity on the Service
                  available to Google Analytics by installing the Google
                  Analytics opt-out browser add-on. The add-on prevents the
                  Google Analytics JavaScript (ga.js, analytics.js and dc.js)
                  from sharing information with Google Analytics about visits
                  activity.
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  For more information on the privacy practices of Google,
                  please visit the Google Privacy & Terms web page:{" "}
                  <Link href="https://policies.google.com/privacy">
                    https://policies.google.com/privacy
                  </Link>
                </Typography>
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Firebase
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Firebase is an analytics service provided by Google Inc.
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  You may opt-out of certain Firebase features through your
                  mobile device settings, such as your device advertising
                  settings or by following the instructions provided by Google
                  in their Privacy Policy:{" "}
                  <Link href="https://policies.google.com/privacy">
                    https://policies.google.com/privacy
                  </Link>
                </Typography>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  {`We also encourage you to review the Google's policy for
                  safeguarding your data:`}{" "}
                  <Link href="https://support.google.com/analytics/answer/6004245">
                    https://support.google.com/analytics/answer/6004245
                  </Link>
                </Typography>{" "}
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  {`For more information on what type of information Firebase
                  collects, please visit the How Google uses data when you use
                  our partners' sites or apps webpage:`}{" "}
                  <Link href="https://policies.google.com/technologies/partner-sites">
                    https://policies.google.com/technologies/partner-sites
                  </Link>
                </Typography>
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ my: 2 }} variant="h4">
            Email Marketing
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may use Your Personal Data to contact You with newsletters,
            marketing or promotional materials and other information that may be
            of interest to You. You may opt-out of receiving any, or all, of
            these communications from Us by following the unsubscribe link or
            instructions provided in any email We send or by contacting Us.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may use Email Marketing Service Providers to manage and send
            emails to You.
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Sendinblue
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  Their Privacy Policy can be viewed at{" "}
                  <Link href="https://www.sendinblue.com/legal/privacypolicy/#privacypolicy">
                    https://www.sendinblue.com/legal/privacypolicy/#privacypolicy
                  </Link>
                </Typography>
              </Typography>
            </ListItem>{" "}
          </List>
          <Typography sx={{ my: 2 }} variant="h4">
            Usage, Performance and Miscellaneous
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may use third-party Service Providers to provide better
            improvement of our Service.
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Invisible reCAPTCHA
                </Box>
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  We use an invisible captcha service named reCAPTCHA. reCAPTCHA
                  is operated by Google.
                </Typography>{" "}
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  The reCAPTCHA service may collect information from You and
                  from Your Device for security purposes.
                </Typography>{" "}
                <Typography
                  sx={{ my: 2 }}
                  color="textSecondary"
                  variant="body1"
                >
                  The information gathered by reCAPTCHA is held in accordance
                  with the Privacy Policy of Google:{" "}
                  <Link href="https://www.google.com/intl/en/policies/privacy/">
                    https://www.google.com/intl/en/policies/privacy/
                  </Link>
                </Typography>{" "}
              </Typography>
            </ListItem>{" "}
          </List>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            GDPR Privacy
          </Typography>
          <Typography sx={{ my: 2 }} variant="h4">
            Legal Basis for Processing Personal Data under GDPR
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may process Personal Data under the following conditions:
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Consent:
                </Box>{" "}
                You have given Your consent for processing Personal Data for one
                or more specific purposes.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Performance of a contract:
                </Box>{" "}
                Provision of Personal Data is necessary for the performance of
                an agreement with You and/or for any pre-contractual obligations
                thereof.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Legal obligations:
                </Box>{" "}
                Processing Personal Data is necessary for compliance with a
                legal obligation to which the Company is subject.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Vital interests:
                </Box>{" "}
                Processing Personal Data is necessary in order to protect Your
                vital interests or of another natural person.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Public interests:
                </Box>{" "}
                Processing Personal Data is related to a task that is carried
                out in the public interest or in the exercise of official
                authority vested in the Company.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Legitimate interests:
                </Box>{" "}
                Processing Personal Data is necessary for the purposes of the
                legitimate interests pursued by the Company.
              </Typography>
            </ListItem>
          </List>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            In any case, the Company will gladly help to clarify the specific
            legal basis that applies to the processing, and in particular
            whether the provision of Personal Data is a statutory or contractual
            requirement, or a requirement necessary to enter into a contract.
          </Typography>
          <Typography sx={{ my: 2 }} variant="h4">
            Your Rights under the GDPR
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            The Company undertakes to respect the confidentiality of Your
            Personal Data and to guarantee You can exercise Your rights.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            You have the right under this Privacy Policy, and by law if You are
            within the EU, to:
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Request access to Your Personal Data.
                </Box>{" "}
                The right to access, update or delete the information We have on
                You. Whenever made possible, you can access, update or request
                deletion of Your Personal Data directly within Your account
                settings section. If you are unable to perform these actions
                yourself, please contact Us to assist You. This also enables You
                to receive a copy of the Personal Data We hold about You.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Request correction of the Personal Data that We hold about
                  You.
                </Box>{" "}
                You have the right to have any incomplete or inaccurate
                information We hold about You corrected.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Object to processing of Your Personal Data.
                </Box>{" "}
                This right exists where We are relying on a legitimate interest
                as the legal basis for Our processing and there is something
                about Your particular situation, which makes You want to object
                to our processing of Your Personal Data on this ground. You also
                have the right to object where We are processing Your Personal
                Data for direct marketing purposes.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Request erasure of Your Personal Data.
                </Box>{" "}
                You have the right to ask Us to delete or remove Personal Data
                when there is no good reason for Us to continue processing it.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Request the transfer of Your Personal Data.
                </Box>{" "}
                We will provide to You, or to a third-party You have chosen,
                Your Personal Data in a structured, commonly used,
                machine-readable format. Please note that this right only
                applies to automated information which You initially provided
                consent for Us to use or where We used the information to
                perform a contract with You.
              </Typography>
            </ListItem>{" "}
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                <Box
                  component={"span"}
                  sx={{ fontWeight: "bold", color: "#003F4C" }}
                >
                  Withdraw Your consent.
                </Box>{" "}
                You have the right to withdraw Your consent on using your
                Personal Data. If You withdraw Your consent, We may not be able
                to provide You with access to certain specific functionalities
                of the Service.
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ my: 2 }} variant="h4">
            Exercising of Your GDPR Data Protection Rights
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            You may exercise Your rights of access, rectification, cancellation
            and opposition by contacting Us. Please note that we may ask You to
            verify Your identity before responding to such requests. If You make
            a request, We will try our best to respond to You as soon as
            possible.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            You have the right to complain to a Data Protection Authority about
            Our collection and use of Your Personal Data. For more information,
            if You are in the European Economic Area (EEA), please contact Your
            local data protection authority in the EEA.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            {`Children's Privacy`}
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            Our Service does not address anyone under the age of 13. We do not
            knowingly collect personally identifiable information from anyone
            under the age of 13. If You are a parent or guardian and You are
            aware that Your child has provided Us with Personal Data, please
            contact Us. If We become aware that We have collected Personal Data
            from anyone under the age of 13 without verification of parental
            consent, We take steps to remove that information from Our servers.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            {`If We need to rely on consent as a legal basis for processing Your
            information and Your country requires consent from a parent, We may
            require Your parent's consent before We collect and use that
            information.`}
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Links to Other Websites
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            {`Our Service may contain links to other websites that are not
            operated by Us. If You click on a third party link, You will be
            directed to that third party's site. We strongly advise You to
            review the Privacy Policy of every site You visit.`}
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We have no control over and assume no responsibility for the
            content, privacy policies or practices of any third party sites or
            services.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Changes to this Privacy Policy
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            We may update Our Privacy Policy from time to time. We will notify
            You of any changes by posting the new Privacy Policy on this page.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            {`We will let You know via email and/or a prominent notice on Our
            Service, prior to the change becoming effective and update the "Last
            updated" date at the top of this Privacy Policy.`}
          </Typography>{" "}
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </Typography>{" "}
          <Typography sx={{ my: 2 }} variant="h4">
            Contact Us
          </Typography>
          <Typography sx={{ my: 2 }} color="textSecondary" variant="body1">
            If you have any questions about this Privacy Policy, You can contact
            us:
          </Typography>{" "}
          <List
            dense
            disablePadding
            sx={{ listStyleType: "disc", pl: 4, color: "#003F4C" }}
          >
            <ListItem sx={{ display: "list-item" }}>
              <Typography color="textSecondary" variant="body1">
                By email: inquiries@esoxbiologics.com
              </Typography>
            </ListItem>
          </List>
        </Container>
      </Box>
    </>
  );
};

PrivacyPolicy.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default PrivacyPolicy;
