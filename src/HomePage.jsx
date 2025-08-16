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

export default function HomePage() {
  const navigate = useNavigate();

  const createSession = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    navigate(`/${code}`);
  };

  return (
    <Container maxW="lg" py={20} centerContent>
      <VStack spacing={6}>
        <Heading size="xl" textAlign="center">
          Easy Paster
        </Heading>

        <Text fontSize="lg" color="gray.600" textAlign="center">
          Instant text sharing via a simple link.
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
            <Text>• Click “New session” to generate a shareable link.</Text>
            <Text>• Send the link to another device or user.</Text>
            <Text>• Type text and hit “Send Text”.</Text>
            <Text>• On the other device, click “Refresh” to retrieve.</Text>
            <Text>• Optionally copy the text or link with one click.</Text>
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
