import { TestCreationForm } from "@/components/Forms/test-creation-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Test",
  description: "Create a new test for your students",
}

export default function CreateTestPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <TestCreationForm />
    </div>
  )
}
