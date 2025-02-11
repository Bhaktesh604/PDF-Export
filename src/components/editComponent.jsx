'use client';

import { Edit } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CldUploadButton } from 'next-cloudinary';

const values = [
    "9kt", "10kt", "11kt", "12kt", "13kt",
    "14kt", "15kt", "16kt", "17kt", "18kt",
    "19kt", "20kt", "21kt", "22kt", "23kt", "24kt"
];

const EditPageComponent = () => {
    const searchParams = useSearchParams();
    const [product, setProduct] = useState(null);
    const [shipping, setShipping] = useState(0);
    const [shippingValue, setShippingValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [bankValues, setBankValues] = useState({});
    const [logoImage, setLogoImage] = useState("")
    const [isGoldSelected, setIsGoldSelected] = useState(false);
    const { toast } = useToast();

    const productId = searchParams.get('id');

    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`/api/product/${productId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch product');
                    }
                    const data = await response.json();
                    console.log("🚀 ~ fetchProduct ~ data:", data)
                    setProduct(data.data);
                    setFormValues(data.data.products[0]);
                    setBankValues(data.data.bankDetails[0]);
                    setLogoImage(data.data.logoImage);
                    setShipping(data.data.shipping);
                    setShippingValue(data.data.shipping);
                    setIsGoldSelected(data.data.products[0].material === "gold");
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchProduct();
        } else {
            setError('Product ID is missing in the URL');
            setLoading(false);
        }
    }, [productId]);

    const handleEditClick = (productData) => {
        window.scrollTo(0, 0);
        setIsEditing(true);
        setFormValues(productData);
        setIsGoldSelected(productData.material === "gold");
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleShpping = async (e) => {
        // setShippingValue(e.target.value);

        const response = await fetch(`/api/product/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shipping: shippingValue }),
        });

        if (!response.ok) {
            throw new Error('Failed to update shipping charges');
        }

        toast({
            title: "Success",
            description: "Shipping charges updated successfully",
            variant: "success",
        });
    };

    const handleImageUpload = (result) => {
        setFormValues(prev => ({ ...prev, image: result?.info?.secure_url }));
    };

    const handleLogoImageUpload = async (result) => {
        setLogoImage(result?.info?.secure_url);
        const response = await fetch(`/api/product/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logoImage: result?.info?.secure_url }),
        });

        if (!response.ok) {
            throw new Error('Failed to update logo');
        }

        const data = await response.json();

        toast({
            title: "Success",
            description: "Logo updated successfully",
            variant: "success",
        });
    };

    const handleBankDetailsSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/product/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bankDetails: bankValues }),
            });

            if (!response.ok) {
                throw new Error('Failed to update bank details');
            }

            const data = await response.json();

            toast({
                title: "Success",
                description: "Bank details updated successfully",
                variant: "success",
            });

            setIsEditing(false);
            setProduct(data.data);
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to update product",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedProducts = product.products.map((prod) =>
                prod.id === formValues.id ? formValues : prod
            );
            console.log("🚀 ~ handleSubmit ~ updatedProducts:", updatedProducts)

            const response = await fetch(`/api/product/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ products: updatedProducts }),
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            const data = await response.json();

            toast({
                title: "Success",
                description: "Product updated successfully",
                variant: "success",
            });

            setIsEditing(false);
            setProduct(data.data);
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to update product",
                variant: "destructive",
            });
        }
    };

    const handleSendData = async () => {
        try {
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: product.products,
                    totalCost: product.products.reduce((sum, prod) => sum + parseFloat(prod.productCost || 0), 0),
                    logoImage: logoImage,
                    bankDetails: bankValues,
                    shipping
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to export pdf');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to export pdf",
                variant: "destructive",
            });
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md shadow-sm bg-gray-50">

                <div>
                    <label>Logo Image</label>
                    <div className="flex items-start gap-4">
                        <CldUploadButton
                            uploadPreset="jewelery"
                            onSuccess={handleLogoImageUpload}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                        >
                            Upload Logo Image
                        </CldUploadButton>
                        {logoImage && (
                            <div className="flex items-center justify-start">
                                <img
                                    src={logoImage}
                                    alt="product"
                                    className="h-[100px] w-[100px] object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label>Image</label>
                    <div className="flex items-start gap-4">
                        <CldUploadButton
                            uploadPreset="jewelery"
                            onSuccess={handleImageUpload}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                        >
                            Upload Image
                        </CldUploadButton>
                        {formValues.image && (
                            <div className="flex items-center justify-start">
                                <img
                                    src={formValues.image}
                                    alt="product"
                                    className="h-[100px] w-[100px] object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label>Material</label>
                    <Select
                        name="material"
                        value={formValues.material}
                        onValueChange={(value) => {
                            setFormValues((prev) => ({ ...prev, material: value }));
                            setIsGoldSelected(value === "gold");
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isGoldSelected && (
                    <>
                        <div>
                            <label>Gold Type</label>
                            <Select
                                name="goldType"
                                value={formValues.goldType}
                                onValueChange={(value) => setFormValues((prev) => ({ ...prev, goldType: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gold type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rose">Rose</SelectItem>
                                    <SelectItem value="yellow">Yellow</SelectItem>
                                    <SelectItem value="white">White</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label>Carat</label>
                            <Select
                                name="carat"
                                value={formValues.carat}
                                onValueChange={(value) => setFormValues((prev) => ({ ...prev, carat: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select carat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {values.map((value) => (
                                        <SelectItem key={value} value={value}>{value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}

                <div>
                    <label>Size</label>
                    <Input
                        name="size"
                        value={formValues.size}
                        onChange={handleFormChange}
                        placeholder="Enter size"
                    />
                </div>

                <div>
                    <label>Main Diamond</label>
                    <Input
                        name="mainDiamond"
                        value={formValues.mainDiamond}
                        onChange={handleFormChange}
                        placeholder="Enter main diamond details"
                    />
                </div>

                <div>
                    <label>Side Stone</label>
                    <Input
                        name="sideStone"
                        value={formValues.sideStone}
                        onChange={handleFormChange}
                        placeholder="Enter side stone details"
                    />
                </div>

                <div>
                    <label>Product Cost</label>
                    <Input
                        name="productCost"
                        value={formValues.productCost}
                        onChange={handleFormChange}
                        placeholder="Enter product cost"
                        type="number"
                    />
                </div>

                <div className=' col-span-2'>
                    <label>Remark</label>
                    <Textarea
                        name="remark"
                        value={formValues.remark}
                        onChange={handleFormChange}
                        placeholder="Enter any remarks"
                    />
                </div>

                <div className="md:col-span-2">
                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600">
                        Save Changes
                    </Button>
                </div>
            </form>

            <form onSubmit={handleBankDetailsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md shadow-sm bg-gray-50 mt-5">
                <div>
                    <label>Bank name</label>
                    <Input
                        name="bankname"
                        value={bankValues?.bankname}
                        onChange={handleBankChange}
                        placeholder="Enter side stone details"
                    />
                </div>
                <div>
                    <label>Acc name</label>
                    <Input
                        name="accname"
                        value={bankValues?.accname}
                        onChange={handleBankChange}
                        placeholder="Enter side stone details"
                    />
                </div>
                <div>
                    <label>Acc number</label>
                    <Input
                        name="accnumber"
                        value={bankValues?.accnumber}
                        onChange={handleBankChange}
                        placeholder="Enter side stone details"
                    />
                </div>
                <div>
                    <label>IFSC</label>
                    <Input
                        name="ifsc"
                        value={bankValues?.ifsc}
                        onChange={handleBankChange}
                        placeholder="Enter side stone details"
                    />
                </div>
                <div>
                    <label>Address</label>
                    <Input
                        name="address"
                        value={bankValues?.address}
                        onChange={handleBankChange}
                        placeholder="Enter side stone details"
                    />
                </div>
                <div>
                    <label>Phone</label>
                    <Input
                        name="phone"
                        value={bankValues?.phone}
                        onChange={handleBankChange}
                        placeholder="Enter side stone details"
                    />
                </div>
                <div className="md:col-span-2">
                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600">
                        Save Bank Changes
                    </Button>
                </div>
            </form>

            <Input
                name="productCost"
                value={shippingValue}
                onChange={(e) => setShippingValue(Number(e.target.value))}
                className="mt-5"
                placeholder="Enter Shipping Charge"
                type="number"
            />

            <div className="md:col-span-2">
                <Button onClick={() => {
                    setShipping(Number(shippingValue))
                    handleShpping()
                }} type="button" className="w-full bg-blue-700 hover:bg-blue-600">
                    Save Shipping Charge
                </Button>
            </div>

            {/* Product Information Section */}
            <ul className="mt-8">
                <p><strong>Logo Image:</strong></p>
                <img src={logoImage} alt="Logo image" className="w-32 h-32 object-cover mt-2" />
                {product.products.map((prod, index) => (
                    <li key={index} className="p-4 border rounded-md shadow-sm bg-gray-50 relative">
                        <p><strong>Image:</strong></p>
                        <img src={prod.image} alt="Product" className="w-32 h-32 object-cover mt-2" />
                        <p><strong>Material:</strong> {prod.material}</p>
                        {prod.material === "gold" && (
                            <>
                                <p><strong>Gold Type:</strong> {prod.goldType}</p>
                                <p><strong>Carat:</strong> {prod.carat}</p>
                            </>
                        )}
                        <p><strong>Size:</strong> {prod.size}</p>
                        <p><strong>Main Diamond:</strong> {prod.mainDiamond}</p>
                        <p><strong>Side Stone:</strong> {prod.sideStone}</p>
                        <p><strong>Product Cost:</strong> ${prod.productCost}</p>
                        <p><strong>Remark:</strong> {prod.remark || "No remark provided"}</p>

                        <div className="absolute right-5 top-5">
                            <Edit onClick={() => handleEditClick(prod)} />
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-6 p-4 border rounded-md shadow-sm bg-gray-100">
                <p className="text-lg font-bold">
                    Total Price:$
                    {product.products.reduce((sum, prod) => sum + parseFloat(prod.productCost || 0), 0) + shipping}
                </p>
            </div>

            <div className="mt-6 p-4 border rounded-md shadow-sm bg-gray-100">
                <p className="text-lg">
                    Bank name: {bankValues?.bankname}
                </p>
                <p className="text-lg">
                    Acc name: {bankValues?.accname}
                </p>
                <p className="text-lg">
                    Acc number: {bankValues?.accnumber}
                </p>
                <p className="text-lg">
                    IFSC Code: {bankValues?.ifsc}
                </p>
                <p className="text-lg">
                    Address: {bankValues?.address}
                </p>
                <p className="text-lg">
                    Phone: {bankValues?.phone}
                </p>
            </div>

            <Button
                className="mt-3"
                onClick={handleSendData}
            >
                Export Pdf
            </Button>
        </div>
    );
};

export default EditPageComponent;