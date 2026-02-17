// ./ProfileSection.tsx
"use client";
import { UPDATE_USER_PROFILE_DETAILS } from "@/client/user/user.mutations";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@apollo/client";
import { Edit2, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfileSection() {
  const { data: userProfileDetails, error: userProfileDetailsError } = useQuery(
    GET_USER_PROFILE_DETAILS
  );

  if (userProfileDetailsError)
    console.log("User profile error", userProfileDetailsError);

  const [
    updateUserProfileDetails,
    {
      loading: updateUserProfileDetailsLoading,
      error: updateUserProfileDetailsError,
    },
  ] = useMutation(UPDATE_USER_PROFILE_DETAILS, {
    refetchQueries: [{ query: GET_USER_PROFILE_DETAILS }],
    awaitRefetchQueries: true,
  });

  if (updateUserProfileDetailsLoading) console.log("Loading user profile");

  if (updateUserProfileDetailsError)
    console.log("User profile Update error", updateUserProfileDetailsError);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: userProfileDetails?.getUserProfileDetails.id || "",
    name: userProfileDetails?.getUserProfileDetails.name || "",
    firstName: userProfileDetails?.getUserProfileDetails.firstName || "",
    email: userProfileDetails?.getUserProfileDetails.email || "",
    lastName: userProfileDetails?.getUserProfileDetails.lastName || "",
    phoneNumber: userProfileDetails?.getUserProfileDetails.phoneNumber || "",
    gender: userProfileDetails?.getUserProfileDetails.gender || "",
    dob: userProfileDetails?.getUserProfileDetails.dob || "",
  });
  useEffect(() => {
    if (userProfileDetails?.getUserProfileDetails) {
      setForm(userProfileDetails.getUserProfileDetails);
    }
  }, [userProfileDetails]);

  // console.log("user", form);
  // console.log("response", userProfileDetails);

  const handleSave = async () => {
    // console.log("user-->", form);
    await updateUserProfileDetails({
      variables: {
        input: {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          dob: form.dob ? new Date(form.dob).toISOString() : null,
        },
      },
    });

    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button
            variant={isEditing ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X size={16} /> : <Edit2 size={16} />}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <Input
              value={form?.firstName || ""}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <Input
              value={form?.lastName || ""}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              value={form?.email || ""}
              disabled={true}
              type="email"
              placeholder="Your email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              minLength={10}
              maxLength={10}
              value={form?.phoneNumber || ""}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <Select
              disabled={!isEditing}
              value={form?.gender || ""}
              onValueChange={(value) => setForm({ ...form, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHERS">Other</SelectItem>
                <SelectItem value="NOT_TO_SAY">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <Input
              type="date"
              value={
                form?.dob ? new Date(form.dob).toISOString().split("T")[0] : ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  dob: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : "",
                })
              }
              disabled={!isEditing}
            />
          </div>
        </div>
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
