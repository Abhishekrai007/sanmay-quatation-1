"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Checkbox,
  Radio,
  RadioGroup,
  Progress,
} from "@nextui-org/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const steps = [
  { title: "BHK Type", description: "Select your BHK type" },
  {
    title: "Rooms to Design",
    description: "Choose the rooms you want to design",
  },
  { title: "Get Quote", description: "Fill in your details to get a quote" },
];

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [selectedBHK, setSelectedBHK] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [carpetArea, setCarpetArea] = useState("");
  const [formOptions, setFormOptions] = useState({});
  const [newOption, setNewOption] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    propertyName: "",
  });

  useEffect(() => {
    if (selectedBHK) {
      fetchOptions();
    }
  }, [selectedBHK]);

  const fetchOptions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/options/${encodeURIComponent(selectedBHK)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        setFormOptions(data);
      } else {
        console.error("Invalid data structure received:", data);
        setFormOptions({});
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      setFormOptions({});
    }
  };

  const handleSelect = (bhk) => {
    setSelectedBHK(bhk);
    setSelectedOptions({});
  };

  const handleOptionChange = (room, option) => {
    setSelectedOptions((prev) => {
      if (room === "Kitchen") {
        return { ...prev, [room]: [option] };
      }
      const roomOptions = prev[room] || [];
      const updatedOptions = roomOptions.includes(option)
        ? roomOptions.filter((opt) => opt !== option)
        : [...roomOptions, option];
      return { ...prev, [room]: updatedOptions };
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim() || !currentRoom) {
      setErrors({ addOption: "Please enter a valid option" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/addCustomOption`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bhkType: selectedBHK,
          category: currentRoom,
          customOption: newOption.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ addOption: data.error });
        return;
      }

      setFormOptions((prev) => ({
        ...prev,
        [currentRoom]: [...(prev[currentRoom] || []), newOption.trim()],
      }));
      setNewOption("");
      onClose();
    } catch (error) {
      setErrors({ addOption: "Failed to add option. Please try again." });
    }
  };

  const validateStep3 = () => {
    const newErrors = {};
    const { name, email, phoneNumber, propertyName } = formData;

    if (!name || name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (!propertyName || propertyName.trim().length === 0) {
      newErrors.propertyName = "Property name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepComplete = () => {
    if (step === 1) return selectedBHK !== "";
    if (step === 2)
      return (
        Object.values(selectedOptions).some((options) => options?.length > 0) ||
        carpetArea.trim() !== ""
      );
    return true;
  };

  const handleSubmit = async () => {
    if (step === 3) {
      if (!validateStep3()) {
        return;
      }

      setIsSubmitting(true);
      const submitData = {
        bhkType: selectedBHK,
        selectedOptions,
        carpetArea,
        ...formData,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Form submission failed");
        }

        setStep(1);
        setSelectedBHK("");
        setSelectedOptions({});
        setCarpetArea("");
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          propertyName: "",
        });
        alert("Form submitted successfully!");
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <fieldset>
              <legend className="sr-only">Select BHK Type</legend>
              {["1 BHK", "2 BHK", "3 BHK"].map((bhk) => (
                <motion.div
                  key={bhk}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`border-2 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedBHK === bhk
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-300 hover:border-amber-300"
                  }`}
                  onClick={() => handleSelect(bhk)}
                  role="radio"
                  aria-checked={selectedBHK === bhk}
                  tabIndex={0}
                >
                  <span className="text-lg font-medium">{bhk}</span>
                </motion.div>
              ))}
            </fieldset>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {Object.entries(formOptions).length > 0 ? (
              Object.entries(formOptions).map(([room, options]) => (
                <motion.div
                  key={room}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">
                      {room.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                  </div>
                  <div className="p-4">
                    {room === "WholeHousePainting" ? (
                      <div>
                        <label
                          htmlFor="carpetArea"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Carpet Area (sq ft)
                        </label>
                        <Input
                          id="carpetArea"
                          value={carpetArea}
                          onChange={(e) => setCarpetArea(e.target.value)}
                          type="number"
                          placeholder="Enter carpet area"
                          min="0"
                          className="max-w-xs"
                          aria-label="Carpet Area in square feet"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {room === "Kitchen" ? (
                          <RadioGroup
                            label={`Select ${room} option`}
                            value={selectedOptions[room]?.[0] || ""}
                            onValueChange={(value) =>
                              handleOptionChange(room, value)
                            }
                          >
                            {options.map((option) => (
                              <Radio key={option} value={option}>
                                {option}
                              </Radio>
                            ))}
                          </RadioGroup>
                        ) : (
                          options.map((option) => (
                            <Checkbox
                              key={option}
                              isSelected={selectedOptions[room]?.includes(
                                option
                              )}
                              onValueChange={() =>
                                handleOptionChange(room, option)
                              }
                            >
                              {option}
                            </Checkbox>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                No options available. Please go back and select a BHK type.
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                variant="bordered"
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                classNames={{
                  base: "max-w-xs",
                }}
                aria-label="Name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <span id="name-error" className="text-red-500 text-xs">
                  {errors.name}
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                variant="bordered"
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                classNames={{
                  base: "max-w-xs",
                }}
                aria-label="Email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <span id="email-error" className="text-red-500 text-xs">
                  {errors.email}
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                variant="bordered"
                isInvalid={!!errors.phoneNumber}
                errorMessage={errors.phoneNumber}
                classNames={{
                  base: "max-w-xs",
                }}
                maxLength={10}
                pattern="[0-9]*"
                aria-label="Phone Number"
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={
                  errors.phoneNumber ? "phoneNumber-error" : undefined
                }
              />
              {errors.phoneNumber && (
                <span id="phoneNumber-error" className="text-red-500 text-xs">
                  {errors.phoneNumber}
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="propertyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Property Name
              </label>
              <Input
                id="propertyName"
                type="text"
                placeholder="Enter property name"
                value={formData.propertyName}
                onChange={handleInputChange}
                variant="bordered"
                isInvalid={!!errors.propertyName}
                errorMessage={errors.propertyName}
                classNames={{
                  base: "max-w-xs",
                }}
                aria-label="Property Name"
                aria-invalid={!!errors.propertyName}
                aria-describedby={
                  errors.propertyName ? "propertyName-error" : undefined
                }
              />
              {errors.propertyName && (
                <span id="propertyName-error" className="text-red-500 text-xs">
                  {errors.propertyName}
                </span>
              )}
            </div>
            {errors.submit && (
              <p className="text-red-500 text-sm mt-4">{errors.submit}</p>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex justify-center space-x-8">
            {steps.map((s, index) => (
              <div
                key={s.title}
                className={`flex items-center ${
                  index < step - 1
                    ? "text-amber-500"
                    : index === step - 1
                    ? "text-black font-medium"
                    : "text-gray-400"
                }`}
              >
                <span className="mr-2 w-6 h-6 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span>{s.title}</span>
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[step - 1].title}
            </h2>
            <p className="text-gray-600">{steps[step - 1].description}</p>
          </div>

          <Progress
            value={(step / steps.length) * 100}
            className="mb-8"
            color="warning"
            aria-label="Form progress"
          />

          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-2 rounded-md ${
                step === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isStepComplete() || isSubmitting}
              className={`px-6 py-2 rounded-md ${
                !isStepComplete() || isSubmitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  {step === 3 ? "Submit" : "Next"}
                  {step !== 3 && <ChevronRight className="w-5 h-5 ml-1" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Add Custom Option
          </ModalHeader>
          <ModalBody>
            <Input
              label="Custom Option"
              placeholder="Enter custom option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              isInvalid={!!errors.addOption}
              errorMessage={errors.addOption}
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddOption}
              isLoading={isSubmitting}
            >
              Add Option
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
