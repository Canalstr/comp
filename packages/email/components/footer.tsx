import { Hr, Link, Section, Text } from '@react-email/components';

export function Footer() {
  return (
    <Section className="w-full">
      <Hr />

      <Text className="font-regular text-[14px]">
        Open Source Compliance,{' '}
        <Link href="https://trycomp.ai?utm_source=email&utm_medium=footer">Passt</Link>.
      </Text>

      <Text className="text-xs text-[#B8B8B8]">
        Passt | 2261 Market Street, San Francisco, CA 94114
      </Text>
    </Section>
  );
}
