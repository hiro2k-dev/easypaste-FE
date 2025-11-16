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
  Flex,
} from "@chakra-ui/react";
import { useClipboard, useToast } from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL;

export default function SessionPage() {
  const toast = useToast();
  const url = window.location.href;
  const { code } = useParams();
  const [text, setText] = useState("");
  const [retrieved, setRetrieved] = useState("");
  const { onCopy: copyUrl } = useClipboard(url);
  const { onCopy: copyText } = useClipboard(retrieved || "");

  const publish = async () => {
    try {
      await axios.post(`${API_URL}/api/publish`, {
        type: "text",
        content: text,
        code,
      });
      toast({
        title: "Text sent",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to send text",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const retrieve = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get/${code}`);
      setRetrieved(res.data.content);
    } catch (err) {
      setRetrieved("");
    }
  };

  useEffect(() => {
    retrieve();
  }, []);

  return (
    <Container maxW="2xl" py={6}>
      <VStack spacing={2} align="stretch">
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Heading size="lg">Easy Paster: Session {code}</Heading>

          <Button
            size="sm"
            onClick={() => {
              copyUrl();
              toast({
                title: "URL copied",
                status: "success",
                duration: 2000,
                isClosable: true,
              });
            }}
          >
            Copy
          </Button>
        </Flex>

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

        <Button colorScheme="green" onClick={retrieve}>
          Refresh
        </Button>

        {retrieved && (
          <>
            <Button
              size="sm"
              onClick={() => {
                copyText();
                toast({
                  title: "Text copied",
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                });
              }}
            >
              Copy Shared Text
            </Button>
            <Box p={4} borderWidth={1} rounded="md" bg="gray.50">
              <pre style={{ whiteSpace: "pre-wrap" }}>{retrieved}</pre>
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
}
