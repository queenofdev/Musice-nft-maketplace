import ExploreCollection from '@/components/ExploreCollection';
import NeverMissCTA from '@/components/NeverMissCTA';
import Footer from '@/components/footer';
import Header from '@/components/header';
import Head from 'next/head';
import React from 'react';

export default function ExplorePage() {
  return (
    <>
      <Head>
        <title>Mosh NFT - Explore Collection</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.svg' />
      </Head>
      <Header />

      <ExploreCollection />
      <div className='mt-20'></div>
      <NeverMissCTA />
      <Footer />
    </>
  );
}
