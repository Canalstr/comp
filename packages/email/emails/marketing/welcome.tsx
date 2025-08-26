import { Body, Container, Font, Heading, Html, Preview, Tailwind } from '@react-email/components';
import { Footer } from '../../components/footer';
import { Logo } from '../../components/logo';

interface Props {
  name: string;
}

export const WelcomeEmail = ({ name }: Props) => {
  return (
    <Html>
      <Tailwind>
        <head>
          <Font
            fontFamily="Geist"
            fallbackFontFamily="Helvetica"
            webFont={{
              url: 'https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-400-normal.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
          />

          <Font
            fontFamily="Geist"
            fallbackFontFamily="Helvetica"
            webFont={{
              url: 'https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-500-normal.woff2',
              format: 'woff2',
            }}
            fontWeight={500}
            fontStyle="normal"
          />
        </head>

        <Preview>Get started with Passt</Preview>

        <Body className="mx-auto my-auto bg-[#fff] font-sans">
          <Container
            className="mx-auto my-[40px] max-w-[600px] border-transparent p-[20px] md:border-[#E8E7E1]"
            style={{ borderStyle: 'solid', borderWidth: 1 }}
          >
            <Logo />
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-[#121212]">
              Welcome to Passt!
            </Heading>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
