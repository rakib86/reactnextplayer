"use client";
import React, { useState } from "react";
import { ReactNextPlayer } from "reactnextplayer";
import { Copy, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Page() {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [propsCopied, setPropsCopied] = useState(false);
  const [props, setProps] = useState({
    src: "https://rakib.sgp1.cdn.digitaloceanspaces.com/Lovable%202.0%20is%20here.%20Multiplayer%20vibe%20coding.%20Smarter%20&%20more%20secure..mp4",
    controls: true,
    autoplay: false,
    muted: false,
    loop: false,
    contextMenu: false,
    className: "w-full h-auto rounded-2xl",
    color: "#ff0000",
    ambientGlow: true,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm i reactnextplayer");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCodeToClipboard = () => {
    const usageCode = `"use client";
import React from "react";
import {ReactNextPlayer} from "reactnextplayer";

export default function App() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <ReactNextPlayer
        src="/sample-video.mp4"
        poster="/poster-image.jpg"
        autoplay={false}
        controls
        color="#ff4757"
        onPlay={() => console.log("Video started")}
        onPause={() => console.log("Video paused")}
        onEnded={() => console.log("Video ended")}
        onTimeUpdate={(t) => console.log("Current time:", t)}
      />
    </div>
  );
}`;
    navigator.clipboard.writeText(usageCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyPropsToClipboard = () => {
    const propsString = Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === "boolean") {
          return value ? `  ${key}` : `  ${key}={false}`;
        }
        return `  ${key}="${value}"`;
      })
      .join("\n");
    const propsCode = `<ReactNextPlayer\n${propsString}\n/>`;
    navigator.clipboard.writeText(propsCode);
    setPropsCopied(true);
    setTimeout(() => setPropsCopied(false), 2000);
  };

  const handlePropChange = (key: string, value: string | boolean) => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            ReactNextPlayer
          </h1>
          <p className="text-gray-400 text-lg">
            A modern, customizable video player for React & Next.js
          </p>

          {/* NPM Install */}
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 font-mono text-sm">
              npm i reactnextplayer
            </div>
            <Button
              onClick={copyToClipboard}
              size="icon"
              className="bg-red-600 hover:bg-red-700"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Player */}
          <div className="space-y-4">
            <ReactNextPlayer {...props} />

            {/* Code Preview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <span>💻</span> Current Configuration
                  </CardTitle>
                  <Button
                    onClick={copyPropsToClipboard}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-gray-800"
                  >
                    {propsCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300">
                    {`<ReactNextPlayer
${Object.entries(props)
  .map(([key, value]) => {
    if (typeof value === "boolean") {
      return value ? `  ${key}` : `  ${key}={false}`;
    }
    return `  ${key}="${value}"`;
  })
  .join("\n")}
/>`}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Controls */}
          <div className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>⚙️</span> Props
                </CardTitle>
                <CardDescription>
                  Customize your player settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Source URL */}
                <div className="space-y-2">
                  <Label htmlFor="src" className="text-white">
                    Source URL
                  </Label>
                  <Input
                    id="src"
                    disabled
                    value="https://racdox.com/video.mp4"
                    onChange={(e) => handlePropChange("src", e.target.value)}
                    className="bg-gray-950 border-gray-700 text-white"
                    placeholder="Video URL"
                  />
                  <p className="text-xs text-gray-500">
                    Video source URL (mp4, webm, etc.)
                  </p>
                </div>

                {/* Color Picker */}
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-white">
                    Primary Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={props.color}
                      onChange={(e) =>
                        handlePropChange("color", e.target.value)
                      }
                      className="w-20 h-10 bg-gray-950 border-gray-700 cursor-pointer"
                    />
                    <Input
                      value={props.color}
                      onChange={(e) =>
                        handlePropChange("color", e.target.value)
                      }
                      className="flex-1 bg-gray-950 border-gray-700 text-white"
                      placeholder="#ff0000"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Primary color (progress, volume, etc.)
                  </p>
                </div>

                {/* Boolean Switches */}
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ambientGlow" className="text-white">
                        Ambient Glow
                      </Label>
                      <p className="text-xs text-gray-500">
                        Enable ambient glow effect
                      </p>
                    </div>
                    <Switch
                      id="ambientGlow"
                      checked={props.ambientGlow}
                      onCheckedChange={(checked) =>
                        handlePropChange("ambientGlow", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="controls" className="text-white">
                        Controls
                      </Label>
                      <p className="text-xs text-gray-500">
                        Show/hide player controls
                      </p>
                    </div>
                    <Switch
                      id="controls"
                      checked={props.controls}
                      onCheckedChange={(checked) =>
                        handlePropChange("controls", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoplay" className="text-white">
                        Autoplay
                      </Label>
                      <p className="text-xs text-gray-500">
                        Auto play video on load
                      </p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={props.autoplay}
                      onCheckedChange={(checked) =>
                        handlePropChange("autoplay", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="muted" className="text-white">
                        Muted
                      </Label>
                      <p className="text-xs text-gray-500">Start muted</p>
                    </div>
                    <Switch
                      id="muted"
                      checked={props.muted}
                      onCheckedChange={(checked) =>
                        handlePropChange("muted", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="loop" className="text-white">
                        Loop
                      </Label>
                      <p className="text-xs text-gray-500">
                        Loop video when finished
                      </p>
                    </div>
                    <Switch
                      id="loop"
                      checked={props.loop}
                      onCheckedChange={(checked) =>
                        handlePropChange("loop", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="contextMenu" className="text-white">
                        Context Menu
                      </Label>
                      <p className="text-xs text-gray-500">
                        Allow right-click menu
                      </p>
                    </div>
                    <Switch
                      id="contextMenu"
                      checked={props.contextMenu}
                      onCheckedChange={(checked) =>
                        handlePropChange("contextMenu", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>📖</span> Usage
                </CardTitle>
                <CardDescription>Quick start example</CardDescription>
              </div>
              <Button
                onClick={copyCodeToClipboard}
                size="icon"
                className="bg-red-600 hover:bg-red-700"
              >
                {codeCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-gray-300">
                {`"use client";
import React from "react";
import {ReactNextPlayer} from "reactnextplayer";

export default function App() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <ReactNextPlayer
        src="/sample-video.mp4"
        poster="/poster-image.jpg"
        autoplay={false}
        controls
        color="#ff4757"
        onPlay={() => console.log("Video started")}
        onPause={() => console.log("Video paused")}
        onEnded={() => console.log("Video ended")}
        onTimeUpdate={(t) => console.log("Current time:", t)}
      />
    </div>
  );
}`}
              </code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
