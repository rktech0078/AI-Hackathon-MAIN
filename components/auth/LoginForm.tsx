'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { signIn } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Email aur password dono fill karein')
            return
        }

        setLoading(true)

        try {
            await signIn(email, password)
            router.push('/')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login mein error aya';
            setError(errorMessage);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-form-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2 className="auth-form-title">Welcome Back</h2>
                <p className="auth-form-subtitle">Enter your credentials to access your account</p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <div className="auth-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={loading}
                    />
                </div>

                <div className="auth-form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="auth-form-footer">
                    {"Don't have an account? "}
                    <Link href="/auth/signup" className="auth-link">
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    )
}
