import React from 'react'
import Layout from '../layouts/Layout'
import { Hero } from '../layouts/Hero'
import { Stats } from '../layouts/Stats'
import { Features } from '../layouts/Features'
import { Guide } from '../layouts/Guide'
import { Items } from '../layouts/Items'
import { QuickStats } from '../layouts/Quickstats'
import { Testimonials } from '../layouts/Testimornials'
import { NewsLetter } from '../layouts/NewsLetter'

export const Homepage = () => {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
        <Layout>
            
            <Hero />

            <Stats />

            <Features/>

            <Guide/>

            <Items/>

            <QuickStats/>

            <Testimonials/>

            <NewsLetter/>
            
        </Layout>
        </div>
  )
}
