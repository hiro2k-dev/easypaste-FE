import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Textarea,
  Text,
  Heading,
  VStack,
  Container,
} from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL;

export default function SessionPage() {
  const { code } = useParams();
  const [text, setText] = useState("");
  const [retrieved, setRetrieved] = useState("");
  const [status, setStatus] = useState("");

  const publish = async () => {
    try {
      await axios.post(`${API_URL}/api/publish`, {
        type: "text",
        content: text,
        code,
      });
      setStatus("✅ Text sent");
    } catch (err) {
      setStatus("❌ Failed to send");
    }
  };

  const retrieve = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get/${code}`);
      setRetrieved(res.data.content);
    } catch (err) {
      setRetrieved("❌ Not found");
    }
  };

  useEffect(() => {
    retrieve();
  }, []);

  return (
    <Container maxW="2xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Easy Paster: Session {code}</Heading>

        <Textarea
          placeholder="Type something to share..."
          rows={10}
          resize="vertical"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button colorScheme="blue" onClick={publish}>
          Send Text
        </Button>
        <Text>{status}</Text>

        <Button colorScheme="green" onClick={retrieve}>
          Refresh
        </Button>

        <Box p={4} borderWidth={1} rounded="md" bg="gray.50">
          <pre style={{ whiteSpace: "pre-wrap" }}>{retrieved}</pre>
        </Box>
      </VStack>
    </Container>
  );
}
