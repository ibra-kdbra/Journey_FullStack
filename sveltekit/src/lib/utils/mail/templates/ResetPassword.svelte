<script lang="ts">
  import { Html, Head, Body, Column, Section, Text } from 'sailkit';
  import { mailTheme } from './mailTheme';

  interface ResetPasswordEmailProps {
    userFirstName: string;
    url: string;
  }

  const { userFirstName, url }: ResetPasswordEmailProps = $props();
</script>

<Html>
  <Head subject="🔒 Reset Your Password" preview="Reset your password securely with this link" theme={mailTheme} />
  <Body>
    <Section>
      <Column>
        <Text paddingBottom="0px">
          <h1>🔒 Reset Your Password</h1>
        </Text>
        <Text>
          <p>Hey, {userFirstName}!</p>
          <p>It looks like you requested a password reset. No worries, we've got you covered!</p>
          <p>Click the link below to reset your password:</p>
          <p>
            <a href={url}>Reset Your Password</a>
          </p>
        </Text>
        <Column.Divider />
        <Text>
          <p>
            If you didn't request this, please ignore this email or
            <a href="https://mailto:sonarfarouq@gmail.com">contact us</a>.
          </p>
          <p>Stay secure 🛟</p>
        </Text>
      </Column>
    </Section>
  </Body>
</Html>
