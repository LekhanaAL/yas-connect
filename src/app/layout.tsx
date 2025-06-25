import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';
import { ChakraProvider, Box, Flex, Image, Text } from '@chakra-ui/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YAS Connect",
  description: "YSS/SRF Devotee World Map - Live Locations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraProvider>
          <Box as="header" position="fixed" top={0} left={0} w="100vw" zIndex={1000} bg="white" boxShadow="sm" px={4} py={2} display="flex" alignItems="center">
            <Flex align="center">
              <Image src="/Lotus-Blue-Circular-2-_medium.fw_.png" alt="YSS/SRF Logo" boxSize="40px" mr={3} />
              <Text fontWeight="bold" fontSize="xl" color="blue.700" letterSpacing="wide">
                YAS Connect
              </Text>
            </Flex>
          </Box>
          <Box pt="60px"> {/* Padding for fixed header */}
            {children}
          </Box>
        </ChakraProvider>
      </body>
    </html>
  );
}
