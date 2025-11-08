'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      redirect('/admin');
    } else {
      redirect('/login');
    }
  }, []);

  return null;
}
