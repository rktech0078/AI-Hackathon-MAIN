'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailForm() {
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const { verifyEmail, sendCode } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return // Only allow single digit

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const verificationCode = code.join('')

        if (verificationCode.length !== 6) {
            setError('Poora 6-digit code enter karein')
            return
        }

        if (!email) {
            setError('Email missing hai')
            return
        }

        setLoading(true)

        try {
            const isValid = await verifyEmail(email, verificationCode)

            if (isValid) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
            } else {
                setError('Invalid code. Dobara try karein.')
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Verification mein error aya')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) return

        setLoading(true)
        setError('')

        try {
            await sendCode(email)
            alert('Naya code bhej diya gaya hai!')
        } catch {
            setError('Code bhejne mein error aya')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-form-container">
            <div className="auth-form verify-form">
                <h2 className="auth-form-title">Verify Your Email</h2>
                <p className="verify-subtitle">
                    Humne <strong>{email}</strong> par 6-digit code bheja hai
                </p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="auth-success">
                        ✓ Email verified! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="code-input-container">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="code-input"
                                disabled={loading || success}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading || success}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <button
                        type="button"
                        onClick={handleResend}
                        className="resend-btn"
                        disabled={loading || success}
                    >
                        Resend Code
                    </button>
                </form>
            </div>
        </div>
    )
}
