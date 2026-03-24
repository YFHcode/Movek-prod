"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

interface ImageGalleryProps {
    images: ProductImage[];
    productName: string;
}

export default function ImageGallery({
    images,
    productName,
}: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const sortedImages = [...images].sort((a, b) => a.ordre - b.ordre);
    const currentImage = sortedImages[selectedIndex];

    return (
        <div>
            {/* Main image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
                <Image
                    src={currentImage.image_url}
                    alt={`${productName} - Image ${selectedIndex + 1}`}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedIndex(i)}
                            className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === selectedIndex
                                    ? "border-movek-orange"
                                    : "border-movek-border hover:border-movek-text-secondary"
                                }`}
                        >
                            <Image
                                src={img.image_url}
                                alt={`${productName} - Miniature ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
