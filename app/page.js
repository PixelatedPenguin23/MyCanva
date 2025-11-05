'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, Modal, Tabs, Form, Input } from 'antd'
import gsap from 'gsap'

const Page = () => {
  const introRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('signIn')

  useEffect(() => {
    const tl = gsap.timeline()

    // Intro animation: dark to white, blur and scale
    tl.fromTo(
      introRef.current,
      { backgroundColor: '#111', filter: 'blur(20px)', scale: 1.2 },
      { backgroundColor: '#fff', filter: 'blur(0px)', scale: 1, duration: 2, ease: 'power2.out' }
    )
  }, [])

  const handleModalOpen = () => setIsModalOpen(true)
  const handleModalClose = () => setIsModalOpen(false)

  return (
    <div ref={introRef} className="h-screen w-screen flex flex-col justify-center items-center transition-colors">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">Welcome to Our App</h1>
      <div className="flex space-x-4">
        <Link href="/canvas">
          <Button type="primary" size="large">Go to Canvas</Button>
        </Link>
        <Button type="default" size="large" onClick={handleModalOpen}>Sign In / Sign Up</Button>
      </div>

      {/* Ant Design Modal */}
      <Modal
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        centered
        width={400}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'signIn',
              label: 'Sign In',
              children: (
                <Form layout="vertical" className="space-y-4">
                  <Form.Item label="Email" name="email">
                    <Input type="email" placeholder="Enter email" />
                  </Form.Item>
                  <Form.Item label="Password" name="password">
                    <Input.Password placeholder="Enter password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" block>Sign In</Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'signUp',
              label: 'Sign Up',
              children: (
                <Form layout="vertical" className="space-y-4">
                  <Form.Item label="Name" name="name">
                    <Input placeholder="Enter name" />
                  </Form.Item>
                  <Form.Item label="Email" name="email">
                    <Input type="email" placeholder="Enter email" />
                  </Form.Item>
                  <Form.Item label="Password" name="password">
                    <Input.Password placeholder="Enter password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" block>Sign Up</Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  )
}

export default Page
