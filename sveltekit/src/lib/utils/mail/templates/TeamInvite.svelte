<script lang="ts">
  import { Html, Head, Body, Column, Section, Text } from 'sailkit';
  import { mailTheme } from './mailTheme';
  interface TeamInviteEmailProps {
    url: string;
    invitedBy: string;
  }

  const { url, invitedBy }: TeamInviteEmailProps = $props();
</script>

<Html>
  <Head
    subject="👥 You're Invited to Collaborate on SvelteKit!"
    preview="Join your team on SvelteKit"
    theme={mailTheme}
  />
  <Body>
    <Section>
      <Column>
        <Text paddingBottom="0px">
          <h1>
            👥 You're Invited to Collaborate on <span style="color: #f59e0b">SvelteKit</span>
          </h1>
        </Text>
        <Text>
          <p>Hey! 👋</p>
          <p>{invitedBy} has invited you to join their team on SvelteKit! 🥁</p>
          <p>To get started, click the link below and accept the invitation:</p>
          <p>
            <a href={url}>Click here to join</a>
          </p>
        </Text>
        <Column.Divider />
        <Text>
          <p>
            If you have any questions, feel free to
            <a href="https://mailto:sonarfarouq@gmail.com">reach out</a>.
          </p>
          <p>Welcome aboard! 🎉</p>
        </Text>
      </Column>
    </Section>
  </Body>
</Html>
