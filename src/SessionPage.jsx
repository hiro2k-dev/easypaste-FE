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
  Divider,
  IconButton,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { useClipboard, useToast, Switch } from "@chakra-ui/react";
import { LuRefreshCcw, LuCopy, LuTrash2 } from "react-icons/lu";
import { IoMdCloudUpload } from "react-icons/io";
import { BiCodeCurly } from "react-icons/bi";
import { v4 as uuidv4 } from "uuid";

const API_URL = import.meta.env.VITE_API_URL;
const CHUNK_SIZE = 1000 * 1024; // 512KB
const RATE_DELAY = 550;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function SessionPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const url = window.location.href;
  const { code } = useParams();

  const [text, setText] = useState("");
  const [retrieved, setRetrieved] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [holdLonger, setHoldLonger] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [timerColor, setTimerColor] = useState("gray.600");

  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const lastReqRef = useRef(0);
  const isUploadingRef = useRef(false);

  const { onCopy: copyUrl } = useClipboard(url);
  const { onCopy: copyText } = useClipboard(retrieved || "");

  const waitForSlot = async (RATE_DELAY_TIME = RATE_DELAY, extraDelay = 0) => {
    const now = Date.now();
    const diff = now - lastReqRef.current;

    if (diff < RATE_DELAY_TIME) {
      await sleep(RATE_DELAY_TIME - diff + extraDelay);
    }

    lastReqRef.current = Date.now();
  };

  const publish = async () => {
    try {
      await waitForSlot();
      await axios.post(`${API_URL}/api/publish`, {
        type: "text",
        content: text,
        code,
      });

      await waitForSlot();
      await retrieve();

      toast({
        title: "Text sent",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch {
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
      await waitForSlot();
      const res = await axios.get(`${API_URL}/api/get/${code}`);
      setRetrieved(res.data.content);
      if (res.data.lastUpdated) setLastUpdated(res.data.lastUpdated);
      if (res.data.holdLonger !== undefined) setHoldLonger(res.data.holdLonger);
    } catch {
      setRetrieved("");
    }
  };

  const toggleHoldLonger = async () => {
    const next = !holdLonger;
    try {
      await waitForSlot();
      await axios.post(`${API_URL}/api/session/${code}/hold-longer`, { holdLonger: next });
      setHoldLonger(next);
      toast({
        title: next ? "Session extended to 2 hours" : "Session set to 10 minutes",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Failed to update session",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchFileInfo = async () => {
    try {
      await waitForSlot();
      const res = await axios.get(`${API_URL}/api/file/meta/${code}`);
      setFileInfo(res.data.file);
    } catch {
      setFileInfo(null);
    }
  };

  const uploadFile = async () => {
    if (isUploading) return;

    if (!file) {
      toast({
        title: "Please choose a file first",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large (max 20MB)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fileId = uuidv4();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setIsUploading(true);
    isUploadingRef.current = true;

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const formData = new FormData();

        formData.append("code", code);
        formData.append("fileId", fileId);
        formData.append("chunkIndex", i);
        formData.append("totalChunks", totalChunks);
        formData.append("fileName", file.name);
        formData.append("file", chunk);

        await waitForSlot();
        await axios.post(`${API_URL}/api/file/chunk`, formData);
        lastReqRef.current = Date.now();
      }

      await waitForSlot();
      await axios.post(`${API_URL}/api/file/finalize`, {
        code,
        fileId,
        totalChunks,
        fileName: file.name,
      });
      lastReqRef.current = Date.now();

      await waitForSlot();
      await fetchFileInfo();
      await waitForSlot();
      await retrieve();

      setFile(null);
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast({
        title: "File uploaded",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: err.response?.data?.error || "Failed to upload file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      isUploadingRef.current = false;
    }
  };

  const downloadFile = () => {
    window.open(`${API_URL}/api/file/download/${code}`, "_blank");
  };

  const deleteSession = async () => {
    try {
      await axios.delete(`${API_URL}/api/session/${code}`);
      toast({
        title: "Session cleared",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/", { replace: true });
    } catch {
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
    (async () => {
      await retrieve();
      await waitForSlot();
      await fetchFileInfo();
    })();
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!lastUpdated) return;

    const duration = holdLonger ? 2 * 60 * 60 * 1000 : 10 * 60 * 1000;

    const tick = () => {
      const expiresAt = new Date(lastUpdated).getTime() + duration;
      const remaining = expiresAt - Date.now();

      if (remaining <= 0) {
        setTimeLeft("Expired");
        setTimerColor("red.500");
        return;
      }

      const totalSeconds = Math.ceil(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        setTimeLeft(`${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      } else {
        setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }

      if (remaining < 60_000) setTimerColor("red.500");
      else if (remaining < 3 * 60_000) setTimerColor("orange.500");
      else setTimerColor("gray.600");
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, holdLonger]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isUploadingRef.current) return;
      await retrieve();
      await fetchFileInfo();
    }, 10_000);
    return () => clearInterval(interval);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectFile = (f) => {
    if (!f) return;

    if (f.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large (max 20MB)",
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
        <Flex justify="space-between" align="center">
          <Heading size="lg">EasyCopy: Session {code}</Heading>

          <Flex bg="gray.50" borderRadius="lg" px={3} py={1.5} gap={2} align="center">
            {timeLeft && (
              <>
                <Text fontSize="sm" fontFamily="mono" fontWeight="medium" color={timerColor}>
                  {timeLeft}
                </Text>
                <Flex align="center" gap={1}>
                  <Switch
                    size="sm"
                    isChecked={holdLonger}
                    onChange={toggleHoldLonger}
                    colorScheme="purple"
                    aria-label="Extend session to 2 hours"
                  />
                  <Text fontSize="xs" color="gray.500">2h</Text>
                </Flex>
                <Divider orientation="vertical" h="20px" />
              </>
            )}
            <IconButton
              icon={<LuCopy />}
              aria-label="Copy session URL"
              variant="ghost"
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
            />
            <IconButton
              icon={<LuTrash2 />}
              aria-label="Clear session"
              variant="ghost"
              size="sm"
              colorScheme="red"
              isDisabled={!sessionExists}
              onClick={deleteSession}
            />
          </Flex>
        </Flex>

        <SimpleGrid
          spacing={4}
          templateColumns={{ base: "1fr", md: "2fr 1fr" }}
          alignItems="flex-start"
        >
          <Box p={4} borderWidth={1} rounded="md" order={{ base: 1, md: 2 }}>
            <Flex align="center" gap={2} mb={3}>
              <Heading size="md">File sharing</Heading>
              <Badge fontSize="xs" colorScheme="gray">max 20MB</Badge>
            </Flex>

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
                if (droppedFile) handleSelectFile(droppedFile);
              }}
            >
              <IoMdCloudUpload
                size={32}
                style={{ marginBottom: 8, display: "inline-block" }}
              />
              <Text fontWeight="medium">Drop a file here, or click to browse</Text>
              <Text fontSize="sm" color="gray.500">Max size 20MB</Text>

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
              isDisabled={!file || isUploading}
              isLoading={isUploading}
              loadingText="Uploading..."
              onClick={uploadFile}
              bg="black"
              color="white"
              _hover={{ bg: "gray.800" }}
              mt="12px"
              w="100%"
            >
              Upload File
            </Button>

            {fileInfo && (
              <Box mt={3}>
                <Text>
                  <b>Current file:</b> {fileInfo.originalName} (
                  {(fileInfo.size / 1024 / 1024).toFixed(2)} MB)
                </Text>

                <Flex gap="6px" mt={2}>
                  <Button w="100%" onClick={downloadFile}>
                    Download File
                  </Button>

                  <Button
                    onClick={() => {
                      const rawUrl = `${API_URL}/api/file/download/${code}`;
                      const wgetCmd = `wget --content-disposition "${rawUrl}"`;
                      navigator.clipboard.writeText(wgetCmd);
                      toast({
                        title: "wget command copied",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                      });
                    }}
                    title="Copy wget command"
                  >
                    <BiCodeCurly size={17} />
                  </Button>
                </Flex>
              </Box>
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
              <Button
                isDisabled={!text}
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
                onClick={publish}
              >
                Send Text
              </Button>

              <Tooltip label="Check for new content">
                <IconButton
                  aria-label="Check for new content"
                  icon={<LuRefreshCcw />}
                  variant="outline"
                  onClick={() => {
                    retrieve();
                    fetchFileInfo();
                  }}
                />
              </Tooltip>
            </SimpleGrid>

            {retrieved && (
              <>
                <Divider my={3} />
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Latest received
                </Text>
                <Box p={4} borderWidth={1} rounded="md" bg="gray.50">
                  <Flex justify="space-between" align="flex-start" gap={2}>
                    <pre style={{ whiteSpace: "pre-wrap", flex: 1, margin: 0 }}>
                      {retrieved}
                    </pre>
                    <IconButton
                      icon={<LuCopy />}
                      aria-label="Copy received text"
                      variant="ghost"
                      size="sm"
                      flexShrink={0}
                      onClick={() => {
                        copyText();
                        toast({
                          title: "Text copied",
                          status: "success",
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    />
                  </Flex>
                </Box>
              </>
            )}
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
