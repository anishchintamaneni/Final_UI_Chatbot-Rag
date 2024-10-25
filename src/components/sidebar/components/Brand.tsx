'use client';

// Chakra imports
import { Flex, useColorModeValue } from '@chakra-ui/react';
import { HSeparator } from '@/components/separator/Separator';
import Image from 'next/image';  // Import Image from Next.js

import WhiteLogo from '/public/img/white_logo.JPG';  // Image file path

export function SidebarBrand() {
  return (
    <Flex justify="center" align="center" className="logo">
      <Image 
        src={WhiteLogo} 
        alt="White Logo"
        width={270}  // Next.js requires width & height or fill
        height={10} 
        style={{ height: 'auto' }} 
        priority  // Ensures the image loads faster
      />
    </Flex>
  );
}

export default SidebarBrand;
