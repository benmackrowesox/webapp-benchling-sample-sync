import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { MainLayout } from "../components/main-layout";
import { gtm } from "../lib/client/gtm";
import { Hero, HeroStandardContents } from "src/components/hero";
import { CenterTextSection } from "src/components/shared/Section";
import { BookAMeeting } from "src/components/shared/BookAMeeting";
import { CaptionIcon } from "src/components/shared/CaptionIcons";
import { BlockCard } from "src/components/shared/BlockCards";
import { BlockCards } from "src/components/shared/BlockCards";
import { PopHeadline } from "src/components/shared/PopHeadline";
import { TextAndImageSection } from "src/components/shared/TextAndImageSection";
import { Section } from "src/components/shared/Section";
import { calendlyConfig } from "src/public-config";
import Stack from "@mui/system/Stack";

const Why: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Why | Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/why/why-hero.png">
          <HeroStandardContents
            title={<>Microbiomes modulate your livestock's&nbsp;health</>}
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
          <TextAndImageSection
            title="A novel approach to disease outbreaks"
            headline={
              "For effective disease management we need more information"
            }
            body={
              <>
                <p>
                  The community of microbes that surround your livestock are
                  essential to their welfare, but over ninety percent of these
                  organisms remain undescribed by science. This 'biological
                  dark-matter' means we lack a true understanding of how
                  microbiomes influence disease outbreaks in aquatic livestock.
                </p>
                <p>
                  By monitoring and describing the unique community of microbes
                  on your farm, we can improve your disease detection, disease
                  prediction and disease prevention capabilities.
                </p>
              </>
            }
            columnSplit="title"
            image={`/why/why-s2.png`}
          />
          <CenterTextSection
            title="The power of the microbiome"
            headline="Microbiomes maintain healthy aquatic environments"
          >
            The microbiome is a complex community of microorganisms that help:
            <BlockCards>
              <CaptionIcon img="/why/why-s3.1.png">
                Recycle waste nutrients
              </CaptionIcon>
              <CaptionIcon img="/why/why-s3.2.png">Oxygenate water</CaptionIcon>

              <CaptionIcon img="/why/why-s3.3.png">
                Support animal digestion
              </CaptionIcon>

              <CaptionIcon img="/why/why-s3.4.png">
                Support animal immunity
              </CaptionIcon>
            </BlockCards>
          </CenterTextSection>
          <TextAndImageSection
            title="Data is essential to preventing disease outbreaks"
            headline="A greater understanding of the microbiome will help you improve your yields"
            columnSplit="headline"
            imageSize="small"
            body={
              <>
                <p>
                  Within all aquatic environments lurk opportunistic pathogens.
                  When stress or poor environmental conditions prevail, these
                  opportunists enact their virulence, harming livestock and
                  affecting your yields.
                </p>

                <p>
                  If these opportunists are unknown to science, early detection
                  assays cannot be designed nor can targeted remedies be
                  developed.
                </p>
              </>
            }
            image={"/why/why-s4.png"}
          />
          <CenterTextSection
            title={
              <>
                The <i>Esox</i> Biologics solution
              </>
            }
            headline={`The world's most expansive genomic database for aquatic microorganisms`}
          >
            {`We are sequencing the genome of every microorganism within aquatic ecosystems.
        With this unique information we are classifying every unknown organism and resolving
        their relationship to environment, health and livestock welfare.`}
            <PopHeadline>
              We exist at the precipice of biology's next frontier: the
              uncategorised majority of aquatic microbes.
            </PopHeadline>
          </CenterTextSection>

          <Section
            title={
              <>
                Your future with <em>Esox</em> Biologics
              </>
            }
            headline={`The more data we collect from your farm,
           the more unique insights we can provide`}
          >
            <BlockCards>
              <BlockCard>
                We produce custom diagnostic assays to detect pathogens unique
                to your environment
              </BlockCard>
              <BlockCard>
                Disease prediction models trained specifically on your farm
              </BlockCard>
              <BlockCard>
                We produce sustainable prebiotics that modulate the unique
                pathogens affecting your livestock
              </BlockCard>
            </BlockCards>
          </Section>
        </Stack>
      </main>
    </>
  );
};

Why.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Why;
