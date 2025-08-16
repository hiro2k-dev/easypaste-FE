import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  VStack,
  Container,
  Text,
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
      </VStack>
    </Container>
  );
}