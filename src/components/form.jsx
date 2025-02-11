"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    material: z.string().nonempty("Please select a material."),
    goldType: z.string().optional(),
    carat: z.string().optional(),
    size: z.string().nonempty("Size is required"),
    mainDiamond: z.string().nonempty("Main diamond details are required"),
    sideStone: z.string().nonempty("Side stone details are required"),
    productCost: z.string().nonempty("Product cost is required"),
    remark: z.string().optional(),
});

const bankformSchema = z.object({
    bankname: z.string().nonempty("Bank name is required"),
    accname: z.string().nonempty("Account name is required"),
    accnumber: z.string().nonempty("Account number is required"),
    ifsc: z.string().nonempty("IFSC code is required"),
    address: z.string().nonempty("Address is required"),
    phone: z.string().nonempty("Phone is required"),
});

const values = [
    "9kt", "10kt", "11kt", "12kt", "13kt",
    "14kt", "15kt", "16kt", "17kt", "18kt",
    "19kt", "20kt", "21kt", "22kt", "23kt", "24kt"
];

export const JewelryForm = () => {
    const [imageUrl, setImageUrl] = useState("");
    const [shipping, setShipping] = useState(0);
    const [logoImageUrl, setLogoImageUrl] = useState("");
    const [products, setProducts] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);
    const [isGoldSelected, setIsGoldSelected] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            material: "",
            goldType: "",
            carat: "",
            size: "",
            mainDiamond: "",
            sideStone: "",
            productCost: "",
            remark: "",
        },
    });

    const bankform = useForm({
        resolver: zodResolver(bankformSchema),
        defaultValues: {
            bankname: "",
            accname: "",
            accnumber: "",
            ifsc: "",
            address: "",
            phone: ""
        },
    });

    const onSubmit = async (values) => {
        if (imageUrl !== "") {
            const newProduct = {
                ...values,
                image: imageUrl,
            };
            setProducts((prev) => [...prev, newProduct]);
            setImageUrl("");
            setIsGoldSelected(false);
            form.reset();
        }
    };

    const onSubmitBank = async (values) => {
        setBankDetails(values);
        bankform.reset();
    }

    const handleImageUpload = (result) => {
        setImageUrl(result.info.secure_url);
    };

    const handleShpping = (e) => {
        setShipping(e.target.value);
    };

    const handleLogoImageUpload = (result) => {
        setLogoImageUrl(result.info.secure_url);
    };

    const handleSendData = async () => {
        try {
            setIsSubmitting(true);

            const finalCost = products.reduce((sum, product) => {
                return sum + parseFloat(product.productCost || 0);
            }, 0);

            const productData = { products, totalPrice: finalCost, logoImage: logoImageUrl, bankDetails, shipping };
            console.log(products);

            const response = await fetch("/api/product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            const res = await response.json();

            const pdfResponse = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ products: res?.data?.products, totalCost: finalCost, logoImage: logoImageUrl, bankDetails, shipping }),
            });

            if (pdfResponse.ok) {
                const blob = await pdfResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'products.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Failed to generate PDF');
            }

            toast({
                title: "Success",
                description: "Products added successfully",
                variant: "success",
            });
            setProducts([]);
            setLogoImageUrl("");
            setShipping(0);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to add products",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full mx-auto">
            <h1 className="text-2xl font-bold mb-6">Jewellery Admin Panel</h1>

            <div className="flex items-start gap-4">
                <CldUploadButton
                    uploadPreset="tail-admin"
                    onSuccess={handleLogoImageUpload}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                >
                    Upload Logo Image
                </CldUploadButton>
                {logoImageUrl && (
                    <div className="flex items-center justify-start">
                        <img
                            src={logoImageUrl}
                            alt="product"
                            className="h-[100px] w-[100px] object-cover"
                        />
                    </div>
                )}
            </div>
            <hr className="mt-5 mb-5" />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <FormItem>
                        <FormLabel>Image</FormLabel>
                        <div className="flex items-start gap-4">
                            <CldUploadButton
                                uploadPreset="tail-admin"
                                onSuccess={handleImageUpload}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                            >
                                Upload Image
                            </CldUploadButton>
                            {imageUrl && (
                                <div className="flex items-center justify-start">
                                    <img
                                        src={imageUrl}
                                        alt="product"
                                        className="h-[100px] w-[100px] object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <FormMessage />
                    </FormItem>
                    <FormField
                        control={form.control}
                        name="material"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Metal</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setIsGoldSelected(value === "gold");
                                    }}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="gold">Gold</SelectItem>
                                        <SelectItem value="platinum">Platinum</SelectItem>
                                        <SelectItem value="silver">Silver</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isGoldSelected && (
                        <>
                            <FormField
                                control={form.control}
                                name="goldType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gold Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gold type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="rose">Rose</SelectItem>
                                                <SelectItem value="yellow">Yellow</SelectItem>
                                                <SelectItem value="white">White</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="carat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carat</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select carat" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {values.map(value => (
                                                    <SelectItem key={value} value={value}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter size" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mainDiamond"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Main Diamond</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter main diamond details" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sideStone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Side Stone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter side stone details" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="productCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Cost</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product cost" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="remark"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Remark</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter any remarks" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="md:col-span-2">
                        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600">
                            Add Product
                        </Button>
                    </div>
                </form>
            </Form>
            <hr className="mt-5 mb-5" />
            <Form {...bankform}>
                <form
                    onSubmit={bankform.handleSubmit(onSubmitBank)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    <FormField
                        control={bankform.control}
                        name="bankname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bank name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bankform.control}
                        name="accname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Acc name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acc name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bankform.control}
                        name="accnumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Acc number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acc number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bankform.control}
                        name="ifsc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>IFSC</FormLabel>
                                <FormControl>
                                    <Input placeholder="IFSC" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bankform.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bankform.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Phone" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="md:col-span-2">
                        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600">
                            Add Bank Details
                        </Button>
                    </div>
                </form>
            </Form>
            <hr className="mt-5 mb-5" />
            <div className="mt-5">
                <label>Shipping cost</label>
                <Input
                    name="productCost"
                    value={shipping}
                    onChange={handleShpping}
                    className="mt-2"
                    placeholder="Enter Shipping Charge"
                    type="number"
                />
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Added Products</h2>
                {products.length === 0 ? (
                    <p>No products added yet.</p>
                ) : (
                    <>
                        <p>
                            <strong>Logo Image:</strong>
                        </p>
                        <img
                            src={logoImageUrl}
                            alt="Product"
                            className="w-32 h-32 object-cover mt-2"
                        />
                        <ul className="space-y-4">
                            {products.map((product, index) => (
                                <li
                                    key={index}
                                    className="p-4 border rounded-md shadow-sm bg-gray-50"
                                >
                                    <p></p>
                                    <p>
                                        <strong>Image:</strong>
                                    </p>
                                    <img
                                        src={product.image}
                                        alt="Product"
                                        className="w-32 h-32 object-cover mt-2"
                                    />
                                    <p>
                                        <strong>Material:</strong> {product.material}
                                    </p>
                                    {product.material === "gold" && (
                                        <>
                                            <p>
                                                <strong>Gold Type:</strong> {product.goldType}
                                            </p>
                                            <p>
                                                <strong>Carat:</strong> {product.carat}
                                            </p>
                                        </>
                                    )}
                                    <p>
                                        <strong>Size:</strong> {product.size}
                                    </p>
                                    <p>
                                        <strong>Main Diamond:</strong> {product.mainDiamond}
                                    </p>
                                    <p>
                                        <strong>Side Stone:</strong> {product.sideStone}
                                    </p>
                                    <p>
                                        <strong>Product Cost:</strong> ${product.productCost}
                                    </p>
                                    <p>
                                        <strong>Remark:</strong> {product.remark || "No remark provided"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 p-4 border rounded-md shadow-sm bg-gray-100">
                            <p className="text-lg font-bold">
                                Total Price: $
                                {products.reduce((sum, product) => sum + parseFloat(product.productCost || 0), 0)}
                            </p>
                        </div>
                    </>
                )}
                <div className="mt-6 p-4 border rounded-md shadow-sm bg-gray-100">
                    <p className="text-lg">
                        Bank name: {bankDetails.bankname}
                    </p>
                    <p className="text-lg">
                        Acc name: {bankDetails.accname}
                    </p>
                    <p className="text-lg">
                        Acc number: {bankDetails.accnumber}
                    </p>
                    <p className="text-lg">
                        IFSC Code: {bankDetails.ifsc}
                    </p>
                    <p className="text-lg">
                        Address: {bankDetails.address}
                    </p>
                    <p className="text-lg">
                        Phone: {bankDetails.phone}
                    </p>
                </div>
                <Button
                    className="mt-3"
                    onClick={() => handleSendData()}
                >
                    {isSubmitting ?
                        <Loader2 className="animate-spin" /> :
                        "Export Pdf"
                    }
                </Button>
            </div>
        </div>
    );
};
