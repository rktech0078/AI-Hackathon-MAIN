import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { AuthProvider } from '@/contexts/AuthContext'
import { AiAgentProvider } from '@/contexts/AiAgentContext'
import dynamic from 'next/dynamic'
import RoboticIcon from '@/components/RoboticIcon'
import AiAgent from '@/components/ai-agent/AiAgent'
import './globals.css'
import './nextra-styles.css'
import 'nextra-theme-docs/style.css'

// Dynamically import UserAvatar to avoid SSR issues
const UserAvatar = dynamic(() => import('@/components/UserAvatar'), {
  ssr: false,
  loading: () => <div style={{ width: '100px', height: '36px' }} />
})

export const metadata = {
  title: {
    default: 'Physical AI & Humanoid Robotics',
    template: '%s | Physical AI Book'
  },
  description: 'A complete AI-native, robotics-first textbook designed for the Panaversity Hackathon. Learn ROS 2, Gazebo, Isaac Sim, and VLA robotics.',
  keywords: ['Physical AI', 'Robotics', 'Humanoid', 'ROS 2', 'Gazebo', 'Isaac Sim', 'VLA', 'AI Agents'],
  authors: [{ name: 'Panaversity' }],
  openGraph: {
    title: 'Physical AI & Humanoid Robotics',
    description: 'Complete textbook for building autonomous humanoid robots',
    type: 'website',
  },
}

const banner = <Banner storageKey="hackathon-2024">🎉 Physical AI Hackathon is Live! Join us in building the future of robotics.</Banner>
const navbar = (
  <Navbar
    logo={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <RoboticIcon />

        <span style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: 'inherit',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap'
        }}>
          Physical AI
        </span>
      </div>
    }
    projectLink="https://github.com/panaversity/physical-ai-hackathon"
  >
    <UserAvatar />
  </Navbar>
)
const footer = (
  <Footer>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
      <div style={{ fontWeight: 600 }}>
        MIT {new Date().getFullYear()} © Abdul Rafay
      </div>
      <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
        Built with ❤️ by Abdul Rafay Khan
      </div>
    </div>
  </Footer>
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <AuthProvider>
          <AiAgentProvider>
            <Layout
              banner={banner}
              navbar={navbar}
              pageMap={await getPageMap()}
              docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
              footer={footer}
            // ... Your additional layout options
            >
              {children}
            </Layout>
            <AiAgent />
          </AiAgentProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
