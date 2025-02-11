'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/product');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {

    fetchProducts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (productId) => {
    router.push(`/edit?id=${productId}`)
  };

  const handleDelete = async (entryId) => {
    const promtRes = confirm("Are you sure, Delete this record?")
    if(promtRes){
      const response = await fetch(`/api/delete-item/${entryId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      fetchProducts();
      toast({
        title: "Success",
        description: "Item deleted successfully",
        variant: "success",
      });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Product History</h1>
      {products.length > 0 ? (
        <div className="space-y-4">
          {products.map((entry) => (
            <div key={entry._id} className="space-y-2">
              <div className="text-sm text-gray-600">
                {formatDate(entry.createdAt)}
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(entry._id)}
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {entry.products.map((product) => (
                  <Card key={product.id} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={`Product ${product.id}`}
                            className="h-full w-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {product.material}
                              {product.goldType && ` - ${product.goldType} ${product.carat}`}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              ${product.productCost}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            Size: {product.size} • Diamond: {product.mainDiamond}
                          </p>
                          {product.remark && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              Note: {product.remark}
                            </p>
                          )}
                        </div>
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleEdit(entry._id)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-gray-500">
            No products available.
          </CardContent>
        </Card>
      )}
    </div>
  );
}