import { useState } from 'react'
import { FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa'
import { cn } from '../../lib/utils'

import ibrahimMalhi  from '../../assets/team/ibrahim_Malhi.jpg'
import harisZafar    from '../../assets/team/haris_zafar.jpg'
import ibrahimGulzar from '../../assets/team/ibrahim_gulzar.jpg'
import naqiAfaq      from '../../assets/team/naqi_afaq.jpg'

const MEMBERS = [
  { id:'1', name:'Ibrahim Malhi',          role:'Developer I',   image:ibrahimMalhi,  social:{} },
  { id:'2', name:'Muhammad Haris Zafar',   role:'Developer II',  image:harisZafar,    social:{ linkedin:'https://www.linkedin.com/in/m-haris-zafar-1a1557326/' } },
  { id:'3', name:'Muhammad Ibrahim Gulzar',role:'Developer III', image:ibrahimGulzar, social:{ linkedin:'https://www.linkedin.com/in/ibrahim-gulzar-043006327/' } },
  { id:'4', name:'Muhammad Naqi Afaq',     role:'Developer IV',  image:naqiAfaq,      social:{ linkedin:'https://www.linkedin.com/in/naqi-afaq-7b38b4326/', github:'https://github.com/naqi005', email:'mailto:mnaqiafaq@gmail.com' } },
]

export default function TeamShowcase({ members = MEMBERS }) {
  const [hoveredId, setHoveredId] = useState(null)
  const col1 = members.filter((_, i) => i % 2 === 0)
  const col2 = members.filter((_, i) => i % 2 !== 0)

  return (
    <div className="flex flex-col md:flex-row items-start gap-10 lg:gap-16 select-none w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex gap-3 flex-shrink-0">
        <div className="flex flex-col gap-3">
          {col1.map(m => <PhotoCard key={m.id} member={m} className="w-[150px] h-[168px] sm:w-[170px] sm:h-[190px]" hoveredId={hoveredId} onHover={setHoveredId} />)}
        </div>
        <div className="flex flex-col gap-3 mt-14">
          {col2.map(m => <PhotoCard key={m.id} member={m} className="w-[150px] h-[168px] sm:w-[170px] sm:h-[190px]" hoveredId={hoveredId} onHover={setHoveredId} />)}
        </div>
      </div>
      <div className="flex flex-col gap-6 pt-0 md:pt-4 flex-1 w-full">
        {members.map(m => <MemberRow key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} />)}
      </div>
    </div>
  )
}

function PhotoCard({ member, className, hoveredId, onHover }) {
  const isActive = hoveredId === member.id
  const isDimmed = hoveredId !== null && !isActive
  return (
    <div
      className={cn('overflow-hidden rounded-2xl cursor-pointer flex-shrink-0', className, isDimmed ? 'opacity-40' : 'opacity-100')}
      style={{ border: isActive ? '1px solid rgba(201,151,58,0.5)' : '1px solid rgba(201,151,58,0.1)', boxShadow: isActive ? '0 0 20px rgba(201,151,58,0.15)' : 'none', transition: 'all 0.3s' }}
      onMouseEnter={() => onHover(member.id)} onMouseLeave={() => onHover(null)}
    >
      <img src={member.image} alt={member.name} className="w-full h-full object-cover"
        style={{ filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(0.8) brightness(0.6)', transition: 'filter 0.5s' }} />
    </div>
  )
}

function MemberRow({ member, hoveredId, onHover }) {
  const isActive = hoveredId === member.id
  const isDimmed = hoveredId !== null && !isActive
  const hasSocial = member.social && Object.keys(member.social).length > 0
  return (
    <div className={cn('cursor-pointer transition-all duration-300', isDimmed ? 'opacity-40' : 'opacity-100')}
      onMouseEnter={() => onHover(member.id)} onMouseLeave={() => onHover(null)}>
      <div className="flex items-center gap-3">
        <span className="h-3 rounded-full flex-shrink-0 transition-all duration-300"
          style={{ width: isActive ? '20px' : '12px', background: isActive ? 'linear-gradient(90deg,#D4AF37,#C9973A)' : 'rgba(201,151,58,0.2)' }} />
        <span className="font-display text-base font-semibold tracking-tight transition-colors duration-300"
          style={{ color: isActive ? '#E8D5A3' : 'rgba(232,213,163,0.6)' }}>
          {member.name}
        </span>
        {hasSocial && (
          <div className="flex items-center gap-1" style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translateX(0)' : 'translateX(-8px)', pointerEvents: isActive ? 'auto' : 'none', transition: 'all 0.2s' }}>
            {member.social.linkedin && (
              <SocialBtn href={member.social.linkedin} title="LinkedIn"><FaLinkedinIn size={11} /></SocialBtn>
            )}
            {member.social.github && (
              <SocialBtn href={member.social.github} title="GitHub"><FaGithub size={11} /></SocialBtn>
            )}
            {member.social.email && (
              <SocialBtn href={member.social.email} title="Email"><FaEnvelope size={11} /></SocialBtn>
            )}
          </div>
        )}
      </div>
      <p className="mt-1.5 pl-[27px] text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'rgba(201,151,58,0.4)' }}>
        {member.role}
      </p>
    </div>
  )
}

function SocialBtn({ href, title, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title}
      onClick={e => e.stopPropagation()}
      className="p-1.5 rounded-lg transition-all duration-150"
      style={{ color: 'rgba(201,151,58,0.6)' }}
      onMouseEnter={e => { e.currentTarget.style.color='#D4AF37'; e.currentTarget.style.background='rgba(201,151,58,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.color='rgba(201,151,58,0.6)'; e.currentTarget.style.background='transparent' }}>
      {children}
    </a>
  )
}
