'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function isBinusEmail(email: string) {
  return email.trim().toLowerCase().endsWith('@binus.ac.id')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string || '').trim()
  const password = formData.get('password') as string

  if (!isBinusEmail(email)) {
    return { error: 'Please sign in using your @binus.ac.id email address.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminData) {
      redirect('/admin')
    }
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string || '').trim()
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const studentId = formData.get('studentId') as string

  if (!isBinusEmail(email)) {
    return { error: 'Please register using your @binus.ac.id email address.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
        `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      data: {
        full_name: fullName,
        student_id: studentId,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/sign-up-success')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data: adminData } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return !!adminData
}
