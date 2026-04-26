"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/app/component/application/tostify";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import ButtonLoading from "@/app/component/buttonLoading";

export default function TournamentForm() {
  const [prizeInputsCount, setPrizeInputsCount] = useState(1); // dynamic inputs count
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const form = useForm({
    defaultValues: {
      title: "",
      startTime: "",
      winPrize: 405,
      perKill: 5,
      entryFee: 10,
      entryType: "Solo",
      map: "Bermuda",
      totalSpots: 48,
      prizeDetails: [0], // initialize with 1 input
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const matchType = searchParams.get("type");

    // Include matchType
    data.matchType = matchType;

    // Convert startTime to Date
    data.startTime = new Date(data.startTime);

    try {
      data.prizeDetails = data.prizeDetails <= 0 ? [] : data.prizeDetails;

      const res = await axios.post("/api/addMatch", { data });
      if (res?.data?.success) {
        showToast("success", "Added successfully");
      } else {
        showToast("error", res?.data?.message || "Something went wrong");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPrizeInput = () => {
    if (prizeInputsCount < 20) {
      setPrizeInputsCount(prizeInputsCount + 1);
      form.setValue("prizeDetails", [...form.getValues("prizeDetails"), 0]);
    }
  };

  const removePrizeInput = (index) => {
    if (prizeInputsCount > 1) {
      setPrizeInputsCount(prizeInputsCount - 1);
      const prizeDetails = form.getValues("prizeDetails");
      prizeDetails.splice(index, 1);
      form.setValue("prizeDetails", prizeDetails);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-lg mx-auto p-4 border rounded"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter tournament title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date & Time */}
        <FormField
          control={form.control}
          name="startTime"
          rules={{ required: "Date & Time is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="datetime-local"
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Win Prize */}
        <FormField
          control={form.control}
          name="winPrize"
          rules={{ required: "Win Prize is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Win Prize</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Prize Inputs */}
        <div className="flex flex-col md:grid-cols-3 gap-3 border bg-black/5 p-3 rounded">
          {Array.from({ length: prizeInputsCount }).map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`prizeDetails.${index}`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {index + 1}
                    {index === 0
                      ? "st"
                      : index === 1
                        ? "nd"
                        : index === 2
                          ? "rd"
                          : "th"}{" "}
                    Prize
                  </FormLabel>

                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input {...field} placeholder="0" type="number" />
                    </FormControl>

                    {prizeInputsCount > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removePrizeInput(index)}
                      >
                        -
                      </Button>
                    )}
                  </div>

                  {/* 🔥 Updated limit to 20 */}
                  {prizeInputsCount < 20 && index === prizeInputsCount - 1 && (
                    <div className="flex items-center w-full">
                      <Button
                        className="w-full mt-2"
                        type="button"
                        onClick={addPrizeInput}
                      >
                        +add
                      </Button>
                    </div>
                  )}
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* Per Kill */}
        <FormField
          control={form.control}
          name="perKill"
          rules={{ required: "Per Kill is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Per Kill</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Entry Fee */}
        <FormField
          control={form.control}
          name="entryFee"
          rules={{ required: "Entry Fee is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Fee</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Entry Type & Map */}
        <div className="flex gap-3">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="entryType"
              rules={{ required: "Entry Type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Duo">Duo</SelectItem>
                        <SelectItem value="Squad">Squad</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={form.control}
              name="map"
              rules={{ required: "Map is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Map</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Map" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bermuda">Bermuda</SelectItem>
                        <SelectItem value="Bermuda 2.0">Bermuda 2.0</SelectItem>
                        <SelectItem value="Lone Wolf">Lone Wolf</SelectItem>
                        <SelectItem value="Kalahari">Kalahari</SelectItem>
                        <SelectItem value="Purgatory">Purgatory</SelectItem>
                        <SelectItem value="Alpine">Alpine</SelectItem>
                        <SelectItem value="NeXTerra">NeXTerra</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Total Spots */}
        <FormField
          control={form.control}
          name="totalSpots"
          rules={{ required: "Total Spots is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Spots</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <ButtonLoading
          type="submit"
          className="w-full mt-4"
          text={" Save Tournament"}
          loading={loading}
        />
      </form>
    </Form>
  );
}
