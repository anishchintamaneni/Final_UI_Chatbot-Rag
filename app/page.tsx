'use client';
/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import {
  Flex, Text, Icon, Input, Select, Button, useColorModeValue,
} from '@chakra-ui/react';
import { MdAutoAwesome, MdPerson } from 'react-icons/md';
import MessageBoxChat from '@/components/MessageBox';

// Speech Recognition setup (compatible with multiple browsers)
const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function Chat({ apiKeyApp }: { apiKeyApp: string }) {
  // State variables
  const [question, setQuestion] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [collection, setCollection] = useState<string>('OEA');
  const [chatHistory, setChatHistory] = useState<
    { type: 'question' | 'answer'; content: string; timestamp?: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Color mode variables
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'whiteAlpha.600');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return alert('Please enter a question.');

    setLoading(true);
    const payload = { method: 'llama3.1', question, collection };

    try {
      const response = await fetch('https://docquest.cogniai.com/api/get-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to fetch the answer.');

      const { message } = await response.json();
      const timestamp = new Date().toLocaleString();

      setChatHistory((prev) => [
        ...prev,
        { type: 'question', content: question, timestamp },
        { type: 'answer', content: message },
      ]);
      setQuestion('');
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching answer:', error);
      alert('Error fetching response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setCollection(e.target.value);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((res) => res[0].transcript)
        .join('');
      setQuestion(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
  }

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <Flex w="100%" h="100vh" direction="row" position="relative" overflow="hidden">
      <Flex w="80%" direction="column">
        {/* Top Section */}
        <Flex h="15%" borderBottom="1px solid" borderColor={borderColor} align="center" justify="center">
        </Flex>

        {/* Dropdown Section */}
        <Flex h="10%" borderBottom="1px solid" borderColor={borderColor} align="center" justify="center">
          <Select
            onChange={handleChange}
            value={collection}
            color={inputColor}
            borderColor={borderColor}
            borderRadius="45px"
            w="200px"
            h="50px"
            zIndex="2000"
          >
            <option value="OEA">APEX</option>
          </Select>
        </Flex>

        {/* Chat Area */}
        <Flex h="60%" direction="column" overflowY="auto" px="20px">
          {chatHistory.map((chat, index) => (
            <Flex key={index} w="100%" mb="10px" align="flex-start">
              {chat.type === 'question' ? (
                <>
                  <Flex
                    borderRadius="full"
                    align="center"
                    justify="center"
                    bg="transparent"
                    border="1px solid"
                    borderColor={borderColor}
                    minW="40px"
                    me="20px"
                  >
                    <Icon as={MdPerson} w="20px" color={brandColor} />
                  </Flex>
                  <Flex
                    p="22px"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="14px"
                    w="100%"
                    direction="column"
                  >
                    <Text color={textColor} fontWeight="600" fontSize={{ base: 'sm', md: 'md' }}>
                      {chat.content}{' '}
                      <Text as="span" fontSize="xs" color="gray.500">
                        ({chat.timestamp})
                      </Text>
                    </Text>
                  </Flex>
                </>
              ) : (
                <Flex p="10px" border="1px solid" borderColor={borderColor} borderRadius="14px" w="100%">
                  <MessageBoxChat output={chat.content} />
                </Flex>
              )}
            </Flex>
          ))}
          <div ref={messagesEndRef} />
        </Flex>

        {/* Input Section */}
        <Flex h="10%" align="center" justify="space-between" px="20px">
          <Input
            minH="54px"
            h="70%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            color={inputColor}
            _placeholder={{ color: placeholderColor }}
            placeholder="Type your message here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            flex="4"
          />
          <Button
            variant="primary"
            w="120px"
            h="54px"
            borderRadius="45px"
            onClick={handleSearch}
            isLoading={loading}
            _hover={{
              boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
            }}
          >
            Submit
          </Button>
          <Button
            variant="primary"
            w="120px"
            h="54px"
            borderRadius="45px"
            onClick={toggleListening}
            _hover={{
              boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
            }}
          >
            {isListening ? 'Stop Listening' : 'Voice Input'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
