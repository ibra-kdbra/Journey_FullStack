<script lang="ts">
  import { Html, Head, Body, Column, Section, Text } from 'sailkit';
  import { mailTheme } from './mailTheme';

  interface WelcomeEmailProps {
    userFirstName: string;
  }

  const { userFirstName }: WelcomeEmailProps = $props();
</script>

<Html>
  <Head
    subject="🥋 Welcome to SvelteKit!"
    preview="We are thrilled to have you onboard. ⭐"
    theme={mailTheme}
  />
  <Body>
    <Section>
      <Column>
        <Text paddingBottom="0px">
          <h1>Welcome to <span style="color: #f59e0b">SvelteKit</span></h1>
        </Text>
        <Text>
          <p>Hey, {userFirstName}!</p>
          <p>We're thrilled to have you onboard. ⭐</p>
        </Text>
        <Column.Divider />
        <Text>
          <p>
            Need help? we are just an <a href="https://mailto:sonarfarouq@gmail.com">email</a> away.
          </p>
        </Text>
      </Column>
    </Section>
  </Body>
</Html>
