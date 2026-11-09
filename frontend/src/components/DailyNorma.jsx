import { useState } from 'react';
import useAuthStore from '../store/authStore';
import DailyNormaModal from './DailyNormaModal';

/**
 * DailyNorma — displays user's target daily water volume (issue #9).
 *
 * Figma ref: «Home screen Tracker of water» node #1059:28074 / #1059:31706
 *   padding: 8px 20px
 *   border-radius: 10px
 *   background: #FFFFFF
 *   border: 1px solid #ECF2FF
 *   box-shadow: 0px 4px 8px 0px rgba(158, 187, 255, 0.12)
 *   gap: 12px
 *   Title: "My daily norma" (Medium 18px / 24px #2F2F2F)
 *   Volume: "2.0 L" (Bold 24px / 24px #407BFF)
 *   Edit button: (Regular 16px / 20px #8BAEFF, hover #FF9D43)
 */
function DailyNorma() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const normaLiters = ((user?.dailyNorma ?? 2000) / 1000).toFixed(1);

  return (
    <>
      <div
        className="inline-flex flex-col gap-3 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-2 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]"
        data-testid="daily-norma-card"
      >
        <h2 className="font-roboto text-lg font-medium leading-6 text-text">
          My daily norma
        </h2>
        <div className="flex items-end gap-3">
          <span className="font-roboto text-2xl font-bold leading-6 text-primary">
            {normaLiters} L
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="font-roboto text-base leading-5 text-[#8BAEFF] transition-colors hover:text-accent cursor-pointer"
            aria-label="Edit daily water rate"
          >
            Edit
          </button>
        </div>
      </div>

      {isModalOpen && <DailyNormaModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export default DailyNorma;

