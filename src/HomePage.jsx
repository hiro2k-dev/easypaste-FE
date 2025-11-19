import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  VStack,
  Container,
  Text,
  Divider,
  Link,
} from "@chakra-ui/react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function HomePage() {
  const navigate = useNavigate();

  const createSession = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/session`);
      const code = res.data.code;
      navigate(`/${code}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    }
  };

  return (
    <Container maxW="lg" py={20} centerContent>
      <VStack spacing={6}>
        <Heading size="xl" textAlign="center">
          Easy Copy
        </Heading>

        <Text fontSize="lg" color="gray.600" textAlign="center">
          A simple shared clipboard between devices - no login, no setup.
        </Text>

        <Text
          fontSize="sm"
          color="red.500"
          fontWeight="semibold"
          textAlign="center"
        >
          ⚠️ Do NOT paste any sensitive data here. For your privacy, delete the
          session after use. Your session data will be deleted automatically
          after 10 minutes of inactivity.
        </Text>

        <Button
          onClick={createSession}
          colorScheme="teal"
          size="lg"
          px={8}
          py={6}
        >
          New session
        </Button>

        <Divider pt={4} />

        <Box textAlign="left" pt={6} w="100%">
          <Heading size="md" mb={2}>
            How to use
          </Heading>
          <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
            <Text>
              • Click “New session” to create a temporary shared space.
            </Text>
            <Text>• Share the generated link with another device or user.</Text>
            <Text>• Send text or upload a file (max 10MB).</Text>
            <Text>
              • The other device can refresh to retrieve the latest data.
            </Text>
            <Text>• Sessions auto-expire after 10 minutes of inactivity.</Text>
            <Text>
              • For privacy, avoid sensitive data or clear the session after
              use.
            </Text>
          </VStack>
        </Box>

        <Box textAlign="center" pt={8} fontSize="sm" color="gray.500">
          Made with ❤️ by Hiro{" "}
          <Link
            href="https://hiro2k-dev.github.io/"
            isExternal
            color="teal.500"
          >
            Contact me
          </Link>
        </Box>
      </VStack>
    </Container>
  );
}
