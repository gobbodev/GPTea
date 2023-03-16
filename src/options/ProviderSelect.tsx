import { Tabs } from '@geist-ui/core'
import { FC, useState } from 'react'

import { ProviderType } from '../config'

const ConfigPanel: FC = () => {
  const [tab, setTab] = useState<ProviderType>()

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onChange={(v) => setTab(v as ProviderType)}>
        <Tabs.Item label="ChatGPT webapp" value={ProviderType.ChatGPT}>
          The API that powers ChatGPT webapp, free, but sometimes unstable
        </Tabs.Item>
        <Tabs.Item label="OpenAI API" value={ProviderType.GPT3}>
          <div className="flex flex-col gap-2">
            <span>
              OpenAI official API - <span className="font-semibold">coming soon</span>
            </span>
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  )
}

function ProviderSelect() {
  return <ConfigPanel />
}

export default ProviderSelect
