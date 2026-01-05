import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Grid } from "@mui/material";
import { MainLayout } from "../../components/main-layout";
import { gtm } from "../../lib/client/gtm";
import { Hero, HeroStandardContents } from "src/components/hero";
import { BookAMeeting } from "src/components/shared/BookAMeeting";
import { StaggeredListItem } from "src/components/shared/StaggeredBlocks";
import { StaggeredBlocks } from "src/components/shared/StaggeredBlocks";
import { FaqSection } from "src/components/shared/FaqSection";
import { CaptionIcon } from "src/components/shared/CaptionIcons";
import { BlockCards } from "src/components/shared/BlockCards";
import { PopHeadline } from "src/components/shared/PopHeadline";
import { TextAndImageSection } from "src/components/shared/TextAndImageSection";
import { CenterTextSection, Section } from "src/components/shared/Section";
import { calendlyConfig } from "src/public-config";
import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import { ColourFlipCard } from "src/components/shared/FlipCard";

const GENERIC_DETECT_FAQS = [
  {
    key: "generic_detect_faq_1",
    question: "Does metabarcoding offer the same insights as metagenomics?",
    children: (
      <span>
        No. Metagenomics offers far <b>more</b> insights. Metabarcoding biases
        detection towards specific organisms by amplifying predetermined genomic
        regions. This amplification method offers a narrow window through which
        to view potential pathogens and introduces bias due to primer
        selectivity. Metagenomics is untargeted and unbiased, with no
        amplification steps. Our Detect metagenomics platform sequences total
        nucleic acids offering the only true representative tool for monitoring
        aquatic microbiomes.
      </span>
    ),
  },
  {
    key: "generic_detect_faq_2",
    question:
      "Can you develop custom assays for me if I only use Detect Livestock?",
    children: (
      <span>
        Yes. If you want to monitor a select few pathogens we can use the unique
        genomic data collected from our Detect platforms to generate custom
        molecular assays that target only these organisms, for custom rapid and
        cost-effective monitoring tools.
      </span>
    ),
  },
  {
    key: "generic_detect_faq_3",
    question: "How quickly will I receive results from your Detect platforms?",
    children:
      "Once we receive and prepare your samples, a custom report will be returned to your personal portal within 72 hours.",
  },
];

const Detect: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Detect | Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/detect/detect-hero.png">
          <HeroStandardContents
            title={"The world's most powerful aquatic pathogen detection tool"}
            subtitle={`Improve your diagnostic accuracy with our novel metagenomics
            workflow that detects all potential pathogens on your farm`}
            heroAction={
              calendlyConfig.calendlyUrl ? (
                <BookAMeeting
                  calendlyUrl={calendlyConfig.calendlyUrl}
                  rootElementId={"mainRoot"}
                />
              ) : (
                <></>
              )
            }
          />
        </Hero>
        <Stack gap={15} sx={{ mt: 10 }}>
          <Section
            title="Unbiased detection with metagenomics"
            headline="Detect identifies all organisms within a sample, not just a targeted selection"
          >
            <Grid
              container
              maxWidth="md"
              justifyItems={"center"}
              justifyContent={"center"}
              rowSpacing={"20px"}
            >
              <Grid item xs={12} sm={6}>
                Our novel workflow offers complete resolution of the organisms
                present on your farm, without introducing bias: phages, viruses,
                parasites, bacteria and fungi are all detected, providing
                insights into novel pathogens, secondary infections and
                cross-clade interactions.
                <p>
                  Detect can identify all potential pathogens ensuring that you
                  make the correct diagnosis and implement treatment only when
                  necessary.
                </p>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                sx={{ paddingLeft: { xs: "10px", sm: "80px" } }}
              >
                <b>
                  Adding Detect to your diagnostic toolbox will provide you
                  with:
                </b>
                <ul
                  style={{
                    listStyleImage: "url(/detect/detect-s2.png)",
                    marginLeft: "20px",
                  }}
                >
                  <li>
                    <span style={{ top: "-30px", position: "relative" }}>
                      Detection of all pathogens, meaning no more missed
                      diagnoses
                    </span>
                  </li>
                  <li>
                    <span style={{ top: "-30px", position: "relative" }}>
                      Context regarding pathogens, livestock and environmental
                      microbiomes
                    </span>
                  </li>
                  <li>
                    <span style={{ top: "-30px", position: "relative" }}>
                      Prognostic capabilities from total microbiome resolution
                    </span>
                  </li>
                </ul>
              </Grid>
            </Grid>
          </Section>
          <CenterTextSection
            title="Finding the missing piece of the puzzle"
            headline="Misdiagnosis and ineffective treatments are consequences of omitting total microbiomes"
          >
            Existing pathogen detection assays are targeted and therefore
            biased. Targeted assays such as qPCR and metabarcoding use primers
            to amplify predetermined regions of genomic DNA from a selection of
            known pathogens. These methods overlook uncommon microorganisms,
            novel pathogens, and pathogenic variant strains.
            <PopHeadline>
              With over ninety percent of aquatic microorganisms still
              undescribed by science, the true cause of infectious diseases is
              often overlooked.¹
            </PopHeadline>
            <Box sx={{ fontSize: "0.75em", textAlign: "left" }}>
              <ol style={{ justifyContent: "center", display: "flex" }}>
                <li>
                  Whitman, W.B. <em>et al.</em> (1998) 'Prokaryotes: The unseen
                  majority',{" "}
                  <em>Proceedings of the National Academy of Sciences</em>,
                  95(12), pp. 6578-6583.
                </li>
              </ol>
            </Box>
          </CenterTextSection>

          <Section
            title="Next generation aquatic diagnostics"
            headline="Unique actionable insights only attainable with Detect"
          >
            Untargeted metagenomics identifies every organism within a sample
            providing extensive data on potential pathogens and optimal
            treatment options.
            <BlockCards>
              <CaptionIcon
                size="med"
                img="/detect/detect-s4.1.png"
                shrinkToFit={false}
              >
                The best opportunity of disease prevention with untargeted
                detection
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect/detect-s4.2.png"
                shrinkToFit={false}
              >
                Save money with the most cost-effective pathogen detection
                service on the market
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect/detect-s4.3.png"
                shrinkToFit={false}
              >
                Faster diagnosis with our 72-hour lab
                <br /> processing time
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect/detect-s4.4.png"
                shrinkToFit={false}
              >
                Receive intuitive results to your mobile with full support from
                expert scientists
              </CaptionIcon>
            </BlockCards>
          </Section>
          <TextAndImageSection
            title={"The power of metagenomics"}
            headline={
              "Genomic science for aquaculture to prevent disease and improve yields"
            }
            columnSplit="body"
            body={
              <>
                <p>
                  We translate the latest innovations developed in clinical
                  medicine and adapt them for aquatic veterinary medicine. The
                  proven success of untargeted metagenomics in clinical medicine
                  <sup>1,2,3</sup> forms the foundation of our Detect platform
                  for aquatic pathogen detection.
                </p>
                <p>
                  Our unique platform collects orders of magnitude more data
                  than conventional diagnostic tools. The data is interpreted
                  and presented to you in the context of your livestock and
                  environment, to provide intuitive and relevant insights that
                  support disease detection and prevention efforts in the
                  context of total microbiomes.
                </p>
                <Box sx={{ fontSize: "0.75em", textAlign: "left" }}>
                  <ol>
                    <li>
                      Wilson, M.R. <em>et al.</em> (2014) 'Actionable Diagnosis
                      of Neuroleptospirosis by Next-Generation Sequencing.',{" "}
                      <em>The New England journal of medicine</em>, 370(25), pp.
                      2408-2417.
                    </li>
                    <li>
                      Naccache, S.N. <em>et al.</em> (2015) 'Diagnosis of
                      Neuroinvasive Astrovirus Infection in an Immunocompromised
                      Adult With Encephalitis by Unbiased Next-Generation
                      Sequencing',
                      <em>
                        {" "}
                        Clinical infectious diseases: an official publication of
                        the Infectious Diseases Society of America
                      </em>
                      , 60(6), pp. 919-923.
                    </li>
                    <li>
                      Chiu, C.Y. and Miller, S.A. (2019) 'Clinical
                      metagenomics',
                      <em> Nature reviews. Genetics</em>, 20(6), pp. 341-355.
                    </li>
                  </ol>
                </Box>
              </>
            }
            image="/detect/detect-s5.png"
          />
          <Section
            title="Detect for every scenario"
            headline="Implement the most effective treatment strategies to improve your farm yields"
          >
            <BlockCards>
              <ColourFlipCard
                image="/detect/detect-s6.1.png"
                title={"Detect Livestock"}
              >
                <Box sx={{ "li + li": { mt: "2px" } }}>
                  Detect Livestock is able to:
                  <ul>
                    <li>
                      Identify every organism within a tissue or swab sample
                      taken from healthy or moribund animals
                    </li>
                    <li>
                      Improve the accuracy of pathogen identification by
                      distinguishing virulent from benign organisms
                    </li>
                    <li>
                      Provide further context to the cause of lesions, sores,
                      inflammation and mortalities
                    </li>
                    <li>
                      Deliver complete microbiome data that will improve your
                      confidence when assigning effective treatments by reducing
                      bias and false negatives
                    </li>
                    <li> All this in just a single assay.</li>
                  </ul>
                </Box>
                See <a href="/detect/livestock">Detect Livestock</a> for more.
              </ColourFlipCard>
              <ColourFlipCard
                image="/detect/detect-s6.2.png"
                title="Detect Environment"
              >
                <Box
                  sx={{
                    "li + li": { mt: "5px" },
                    mt: "35px",
                  }}
                >
                  Detect Environment is able to:
                  <ul>
                    <li>
                      Identify every organism within the local microbiome{" "}
                    </li>
                    <li>
                      Detect potential pathogens before disease manifests{" "}
                    </li>
                    <li>
                      Provide preventative insights in the fight against disease
                    </li>
                    <li>
                      Reveal organism abundance in environments such as RAS,
                      open-water pens and inland ponds.
                    </li>
                    <li>
                      Help your farm stay ahead of the curve in the battle
                      against disease
                    </li>
                  </ul>
                </Box>
                <br />
                See <a href="/detect/environment">Detect Environment</a> for
                more.
              </ColourFlipCard>
            </BlockCards>
          </Section>
          <Section
            title="Simple and effective"
            headline="The Esox workflow was designed with aquatic veterinarians in mind"
          >
            <StaggeredBlocks>
              <StaggeredListItem
                img="/detect/detect-s7.1.png"
                caption="Create an account and initiate your first consultation with us."
              />
              <StaggeredListItem
                img="/detect/detect-s7.2.png"
                caption="Place your first order and receive your sample kits."
              />
              <StaggeredListItem
                img="/detect/detect-s7.3.png"
                caption="Return your sample and track the status of your order through your personalised portal."
              />
              <StaggeredListItem
                img="/detect/detect-s7.4.png"
                caption="Receive notification that your results are ready to view."
              />
              <StaggeredListItem
                img="/detect/detect-s7.5.png"
                caption="View results, recommended treatment plans and ask us any questions you may have."
              />
            </StaggeredBlocks>
          </Section>
          <FaqSection faqs={GENERIC_DETECT_FAQS} />
        </Stack>
      </main>
    </>
  );
};

Detect.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Detect;
