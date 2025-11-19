// src/SessionPage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Textarea,
  Text,
  Heading,
  VStack,
  Container,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { useClipboard, useToast } from "@chakra-ui/react";
import { LuRefreshCcw } from "react-icons/lu";
import { IoMdCloudUpload } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

export default function SessionPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const url = window.location.href;
  const { code } = useParams();

  const [text, setText] = useState("");
  const [retrieved, setRetrieved] = useState("");

  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { onCopy: copyUrl } = useClipboard(url);
  const { onCopy: copyText } = useClipboard(retrieved || "");

  const publish = async () => {
    try {
      await axios.post(`${API_URL}/api/publish`, {
        type: "text",
        content: text,
        code,
      });
      await retrieve();
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

  const fetchFileInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/file/meta/${code}`);
      setFileInfo(res.data.file);
    } catch (err) {
      setFileInfo(null);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast({
        title: "Please choose a file first",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large (max 10MB)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("code", code);
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/api/file/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchFileInfo();

      setFile(null);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "File uploaded",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to upload file";
      toast({
        title: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const downloadFile = () => {
    window.open(`${API_URL}/api/file/download/${code}`, "_blank");
  };

  const deleteSession = async () => {
    try {
      await axios.delete(`${API_URL}/api/session/${code}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Session cleared",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/", { replace: true });
    } catch (err) {
      toast({
        title: "Failed to clear session",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const sessionExists = retrieved !== "" || fileInfo !== null;

  useEffect(() => {
    retrieve();
    fetchFileInfo();
  }, [code]);

  const handleSelectFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large (max 10MB)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setFile(f);
    toast({
      title: `Selected: ${f.name}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="4xl" py={6}>
      <VStack spacing={4} align="stretch">
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Heading size="lg">Easy Paster: Session {code}</Heading>

          <Flex gap={2}>
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
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={deleteSession}
              disabled={!sessionExists}
            >
              Clear
            </Button>
          </Flex>
        </Flex>
        <SimpleGrid
          spacing={4}
          templateColumns={{ base: "1fr", md: "2fr 1fr" }}
          alignItems="flex-start"
        >
          <Box p={4} borderWidth={1} rounded="md" order={{ base: 1, md: 2 }}>
            <Heading size="md" mb={3}>
              File sharing (max 10MB)
            </Heading>

            <Box
              mt={2}
              p={6}
              borderWidth={2}
              borderStyle="dashed"
              rounded="md"
              textAlign="center"
              cursor="pointer"
              bg={isDragging ? "purple.50" : "gray.50"}
              borderColor={isDragging ? "purple.400" : "gray.300"}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  handleSelectFile(droppedFile);
                }
              }}
            >
              <IoMdCloudUpload
                size={32}
                style={{ marginBottom: 8, display: "inline-block" }}
              />
              <Text fontWeight="medium">
                Drop a file here, or click to browse
              </Text>
              <Text fontSize="sm" color="gray.500">
                Max size 10MB
              </Text>

              {file && (
                <Text mt={2} fontSize="sm">
                  Selected: <b>{file.name}</b> (
                  {(file.size / 1024 / 1024).toFixed(2)} MB)
                </Text>
              )}
            </Box>

            <input
              type="file"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleSelectFile(f);
              }}
            />

            <Button
              isDisabled={!file}
              onClick={uploadFile}
              colorScheme="purple"
              mt="12px"
              w="100%"
            >
              Upload File
            </Button>

            {fileInfo ? (
              <Box mt={3}>
                <Text>
                  <b>Current file:</b> {fileInfo.originalName} (
                  {(fileInfo.size / 1024 / 1024).toFixed(2)} MB)
                </Text>
                <Button mt={2} onClick={downloadFile}>
                  Download File
                </Button>
              </Box>
            ) : (
              <></>
            )}
          </Box>

          <Box order={{ base: 2, md: 1 }}>
            <Textarea
              placeholder="Type something to share..."
              height="214px"
              resize="vertical"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <SimpleGrid mt={3} spacing={2} templateColumns="5fr 1fr">
              <Button isDisabled={!text} colorScheme="blue" onClick={publish}>
                Send Text
              </Button>

              <Button
                colorScheme="green"
                onClick={() => {
                  retrieve();
                  fetchFileInfo();
                }}
              >
                <LuRefreshCcw />
              </Button>
            </SimpleGrid>

            {retrieved && (
              <Box
                mt={2}
                p={4}
                pt={4}
                borderWidth={1}
                rounded="md"
                bg="gray.50"
                position="relative"
              >
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.600"
                  position="absolute"
                  top="4px"
                  right="4px"
                  height="24px"
                  fontSize="11px"
                  px={2}
                  _hover={{ bg: "gray.200" }}
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
                  Copy
                </Button>

                <pre style={{ whiteSpace: "pre-wrap" }}>{retrieved}</pre>
              </Box>
            )}
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
