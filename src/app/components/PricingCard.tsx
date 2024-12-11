'use client'

import { CheckIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
  priceId: string
}

const PricingCard = ({
  title,
  price,
  description,
  features,
  buttonText,
  popular = false,
  priceId
}: PricingCardProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleClick = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth?view=sign-up')
        return
      }

      console.log('Pricing plan selected:', priceId)
      // Add your custom handling here

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className={`relative bg-[#111111] rounded-2xl p-8 border ${
        popular ? 'border-[#FFBE1A]' : 'border-white/5'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFBE1A] text-black text-sm font-medium px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60">{description}</p>
      </div>
      <div className="mb-6">
        <p className="text-4xl font-bold text-white">${price}</p>
        <p className="text-white/60">per month</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-white/80">
            <CheckIcon className="h-5 w-5 flex-shrink-0 text-[#FFBE1A]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          popular
            ? 'bg-[#FFBE1A] text-black hover:bg-[#FFBE1A]/90'
            : 'bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
    </div>
  )
}

export default PricingCard 