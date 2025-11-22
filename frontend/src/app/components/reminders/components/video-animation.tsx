"use client"

import React from "react"

interface VideoAnimationProps {
  src: string
  label?: string
  className?: string
}

export function VideoAnimation({ src, label = "animation", className = "" }: VideoAnimationProps) {
  return (
    <div className={`avatar-wrapper ${className}`} style={{ width: "100%", height: "100%" }}>
      <video
        src={src}
        aria-label={label}
        autoPlay
        loop
        muted
        playsInline
        className="avatar-video"
      />
      <div className="avatar-frame" />
      <div className="avatar-ring" />
    </div>
  )
}

export default VideoAnimation