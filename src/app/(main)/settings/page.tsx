"use client";
import { EmailIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function PersonalInfoForm() {
  const router = useRouter();

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    username: "",
  });

  const [formState, setFormState] = useState({
    fullName: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const email = parsed.email || "";
        const username = email.split("@")[0] || "";
        const fullName = parsed.name || "";

        setUser({ fullName, email, username });
        setFormState({ fullName });
      } catch (err) {
        console.error("Failed to parse user data from localStorage", err);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch("/instructor/profile/edit/", {
        method: "PATCH",
        body: JSON.stringify({ name: formState.fullName }),
      });

      // Update localStorage user
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const updatedUser = { ...JSON.parse(storedUser), name: formState.fullName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Optional: reload the page or update state
      setUser({ ...user, fullName: formState.fullName });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert("❌ Error updating name: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShowcaseSection title="Personal Information" className="!p-7">
      <form onSubmit={handleSubmit}>
        <InputGroup
          className="mb-5.5"
          type="text"
          name="fullName"
          label="Full Name"
          placeholder="Full Name"
          value={formState.fullName}
          handleChange={handleChange}
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
          readOnly={false}
        />

        <InputGroup
          className="mb-5.5"  

          type="email"
          name="email"
          label="Email Address"
          placeholder="Email"
          value={user.email}
          handleChange={() => {}}
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
          readOnly
        />
        <div className="flex justify-end gap-3">
          <button
  className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
  type="button"
  onClick={() => router.push("/")}
>
  Cancel
</button>

          <button
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
