"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { Camera } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Label } from "@/components/ui/label";

const profileFormSchema = z.object({
  fullname: z.string().max(30, {
    message: "Username must not be longer than 30 characters.",
  }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  avatarUrl: z.string().optional(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  bio: "I own a computer.",
  urls: [
    { value: "https://shadcn.com" },
    { value: "http://twitter.com/shadcn" },
  ],
};

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
      } else {
        form.setValue("fullname", user.user_metadata.full_name || "");
        form.setValue("email", user.email || "");
        form.setValue("avatarUrl", user.user_metadata.avatar_url || "");
        console.log(user);
      }
    };
    fetchUser();
  }, [supabase, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullname,
          avatar_url: data.avatarUrl,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Avatar</FormLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={field.value || ""} />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        {...field}
                        className="flex-1"
                      />
                      {uploading && (
                        <Button disabled variant="outline" size="icon">
                          <Camera className="h-4 w-4 animate-pulse" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                </div>
                <FormDescription>
                  Enter a URL to an image. If the URL is invalid, a default
                  avatar will be shown.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} className="w-full" />
                </FormControl>
                <FormDescription>
                  This is your public display name. It can be your real name or
                  a pseudonym.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                value={user?.user_metadata.email}
                readOnly
                disabled
                className="w-full opacity-70"
              />
            </FormControl>
            <FormDescription>
              Your email address cannot be changed.
            </FormDescription>
          </FormItem>

          {/* <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  You can manage verified email addresses in your{" "}
                  <a href="/examples/forms">email settings</a>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none w-full"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <div className="space-y-4">
            {form.watch("urls")?.map((_, index) => (
              <FormField
                control={form.control}
                key={index}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                      URLs
                    </FormLabel>
                    <FormDescription
                      className={index !== 0 ? "sr-only" : undefined}
                    >
                      Add links to your website, blog, or social media profiles.
                    </FormDescription>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                form.setValue("urls", [
                  ...(form.watch("urls") || []),
                  { value: "" },
                ])
              }
            >
              Add URL
            </Button>
          </div> */}
          <Button type="submit" className="w-full">
            Update profile
          </Button>
        </form>
      </Form>
      {user?.app_metadata?.provider === "email" && (
        <div className="mt-4">
          <Label className="">Password</Label>
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/reset-password")}
              type="button"
            >
              Change Password
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Reset your password by clicking the button above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
